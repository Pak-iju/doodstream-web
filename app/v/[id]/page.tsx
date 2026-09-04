import {
    CalendarIcon,
    CubeIcon,
    DownloadIcon,
    LapTimerIcon,
    RocketIcon,
    Share1Icon,
} from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata, ResolvingMetadata } from "next";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { humanDuration, humanSize } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import CopyButton from "@/components/copy-button";
import LikeButton from "@/components/like-button";
import Link from "next/link";
import MessageBox from "@/components/message-box";
import React from "react";
import { SITENAME } from "@/lib/constants";
import SearchCardList from "@/components/search/search-list";
import doodstream from "@/lib/doodstream";
import PlayerWrapper from "@/components/player-wrapper";

// Memaksa halaman untuk di-render secara dinamis di Cloudflare Edge
export const dynamic = "force-dynamic";

type PageProps = {
    params: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
    { params }: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    try {
        const fileCode = typeof params?.id === "string" ? params.id : "";
        if (!fileCode) return { title: SITENAME };

        const data = await doodstream.getFile({ file_code: fileCode });
        if (!data || data.status !== 200 || !data.result?.[0]) {
            return {
                title: data?.msg || "Video Not Found",
                description: "Something went wrong. Please try again later.",
            };
        }

        const file = data.result[0];
        const title = `${file.title || "Video"} - ${SITENAME}`;
        const description = `${file.title} - Duration: ${humanDuration(
            file.length
        )} - Views: ${file.views} views - Size: ${humanSize(
            file.size
        )}`;
        const image = file.splash_img || "";
        const previousOgImages = (await parent).openGraph?.images || [];
        const previousTwImages = (await parent).twitter?.images || [];

        return {
            title,
            description,
            twitter: {
                title,
                description,
                images: image ? [...previousTwImages, image] : previousTwImages,
            },
            openGraph: {
                title,
                description,
                images: image ? [...previousOgImages, image] : previousOgImages,
            },
        };
    } catch (err) {
        return {
            title: SITENAME,
            description: "Error loading metadata",
        };
    }
}

export default async function Video({ params }: PageProps) {
    const fileCode = typeof params?.id === "string" ? params.id : "";

    if (!fileCode) {
        return (
            <MessageBox title="Invalid File Code" countdown={30} variant="error">
                <p className="text-center">File code parameter is missing.</p>
            </MessageBox>
        );
    }

    let data;
    let upstream = "doodstream.com";

    try {
        data = await doodstream.getFile({ file_code: fileCode });
        upstream = await doodstream.getUpstream();
    } catch (err) {
        console.error("Fetch error:", err);
    }

    // Penanganan jika API error atau file tidak ditemukan
    if (!data || data.status !== 200 || !data.result?.[0]) {
        return (
            <MessageBox title={data?.msg || "Video Not Found"} countdown={30} variant="error">
                <p className="text-center">
                    Something went wrong or the video is no longer available.
                </p>
            </MessageBox>
        );
    }

    const file = data.result[0];

    // Format tanggal yang aman agar tidak crash saat di-parse
    let uploadedDate = "Unknown";
    if (file.uploaded) {
        try {
            const parsedDate = new Date(file.uploaded.includes("Z") ? file.uploaded : file.uploaded + ".000Z");
            if (!isNaN(parsedDate.getTime())) {
                uploadedDate = parsedDate.toLocaleString();
            } else {
                uploadedDate = file.uploaded;
            }
        } catch (e) {
            uploadedDate = file.uploaded;
        }
    }

    return (
        <div className="grid col-span-full gap-4 md:gap-4 md:mx-10">
            {/* Player Video dengan fitur Overlay Popunder */}
            <PlayerWrapper 
                src={`https://${upstream}/${file.protected_embed}`} 
                cooldownHours={0.5} 
            />

            <Card className="mx-2 mb-8">
                <CardHeader>
                    <CardTitle className="text-xl md:text-3xl font-bold">
                        {file.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-flow-row lg:grid-flow-col">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="flex gap-2 items-center">
                                        <LapTimerIcon className="size-4 md:size-5" />
                                        Duration
                                    </TableCell>
                                    <TableCell>
                                        {humanDuration(file.length)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="flex gap-2 items-center">
                                        <RocketIcon className="size-4 md:size-5" />
                                        Views
                                    </TableCell>
                                    <TableCell>{file.views}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="flex gap-2 items-center">
                                        <CubeIcon className="size-4 md:size-5" />
                                        Size
                                    </TableCell>
                                    <TableCell>
                                        {humanSize(file.size)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="flex gap-2 items-center">
                                        <CalendarIcon className="size-4 md:size-5" />
                                        Uploaded
                                    </TableCell>
                                    <TableCell>
                                        {uploadedDate}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div className="grid grid-cols-2 gap-2 mt-8 md:grid-cols-3 lg:grid-cols-2 lg:ml-4 lg:my-4">
                            <Link
                                href={`https://${upstream}/d/${file.filecode}`}
                                className="col-span-full md:col-auto lg:col-span-full"
                            >
                                <Button className="w-full">
                                    <DownloadIcon className="size-4 me-1 mb-1" />
                                    Download
                                </Button>
                            </Link>
                            <CopyButton className="bg-secondary lg:col-span-full">
                                <Share1Icon className="size-4 me-1 mb-0.5" />
                                Share
                            </CopyButton>
                            <LikeButton
                                className="lg:col-span-full"
                                useButton={true}
                                file={file}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <h1 className="text-2xl font-bold text-center my-4">
                Related Videos
            </h1>
            <SearchCardList query={file.title ? file.title.split(" ")[0] : ""} />
        </div>
    );
}
