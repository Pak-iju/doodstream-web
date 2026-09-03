'use client';

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CardList from "@/components/card-list";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import SearchCardList from "@/components/search/search-list";

function HomeContent() {
    const searchParams = useSearchParams();

    const pageParam = searchParams.get("page");
    const perPageParam = searchParams.get("per_page");
    const fldIdParam = searchParams.get("fld_id");
    const queryParam = searchParams.get("q");

    const page = pageParam ? parseInt(pageParam) : 1;
    const per_page = perPageParam ? parseInt(perPageParam) : DEFAULT_PER_PAGE;
    const fld_id = fldIdParam || undefined;
    const query = queryParam || undefined;

    return (
        <div className="md:my-2">
            {query ? (
                <SearchCardList query={query} banner />
            ) : (
                <CardList page={page} per_page={per_page} fld_id={fld_id} />
            )}
        </div>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}
