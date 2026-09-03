import {
    DEFAULT_PER_PAGE,
    DEFAULT_REVALIDATE_INTERVAL,
    DOODSTREAM_API_KEY,
    DOODSTREAM_BASE_URL,
} from "./constants";

type DoodstreamProps = {
    baseUrl?: string;
    key?: string;
};

class Doodstream {
    baseUrl: string;
    key: string;
    upstream: string | undefined;

    constructor(
        { baseUrl, key }: DoodstreamProps = {
            baseUrl: undefined,
            key: undefined,
        }
    ) {
        baseUrl = baseUrl || DOODSTREAM_BASE_URL;
        key = key || DOODSTREAM_API_KEY;

        if (!baseUrl) throw new Error("Doodstream Base URL not set");
        if (!key) throw new Error("Doodstream Key not set");

        this.baseUrl = baseUrl;
        this.key = key;
    }

    serializeQueryParams(params: { [key: string]: string }) {
        return new URLSearchParams(params).toString();
    }

    async fetch(
        cmd: string,
        params: { [key: string]: string },
        revalidate?: number
    ) {
        params.key = this.key;
        
        // Pembersihan URL dari double slash jika baseUrl mengandung trailing slash
        const cleanBaseUrl = this.baseUrl.replace(/\/$/, "");
        const url = `${cleanBaseUrl}/api${cmd}?${this.serializeQueryParams(params)}`;

        try {
            const response = await fetch(url, {
                next: { revalidate: revalidate ?? DEFAULT_REVALIDATE_INTERVAL },
            });

            if (!response.ok) return { status: 500, msg: "Failed to fetch from Doodstream" };

            return await response.json();
        } catch (error) {
            console.error("Doodstream API Fetch Error:", error);
            return { status: 500, msg: "Server Connection Error" };
        }
    }

    async listFiles({
        page = 1,
        per_page = DEFAULT_PER_PAGE,
        fld_id = "",
    }: {
        page?: number;
        per_page?: number;
        fld_id?: string;
    }) {
        if (per_page && per_page > 200)
            throw new Error("per_page cannot be greater than 200");

        // Di-cache selama 5 menit (300 detik) untuk menghemat request list video
        const data = await this.fetch(
            "/file/list",
            {
                page: page.toString(),
                per_page: per_page.toString(),
                fld_id: fld_id.toString(),
            },
            300
        );
        return data;
    }

    async getFile({ file_code }: { file_code: string }) {
        // Info detail 1 video jarang berubah, di-cache 1 jam (3600 detik)
        const data = await this.fetch("/file/info", { file_code }, 3600);
        return data;
    }

    async search({ query }: { query: string }) {
        // Pencarian di-cache selama 10 menit (600 detik)
        const data = await this.fetch(
            "/search/videos",
            { search_term: query },
            600
        );
        return data;
    }

    async listFolders({ fld_id = "" }: { fld_id?: string }) {
        // Folder di-cache selama 1 jam (3600 detik)
        const data = await this.fetch(
            "/folder/list", 
            { only_folders: "1", fld_id },
            3600
        );
        return data;
    }

    async getFolder({ fld_id }: { fld_id: string }) {
        const data = await this.listFolders({ fld_id: "" });
        if (!data?.result?.folders) return { ...data, folder: null };

        const folder = data.result.folders.find(
            (f: any) => f.fld_id === fld_id
        );
        return {
            ...data,
            folder,
        };
    }

    async getUpstream() {
        if (this.upstream) return this.upstream;

        const data = await this.listFiles({ page: 1, per_page: 1 });
        const sampleFile = data?.result?.files?.[0];
        
        if (!sampleFile || !sampleFile.download_url) {
            return "doodstream.com"; // Default fallback domain jika API kosong
        }

        try {
            const url = new URL(sampleFile.download_url);
            this.upstream = url.hostname;

            setTimeout(() => {
                this.upstream = undefined;
            }, (DEFAULT_REVALIDATE_INTERVAL || 300) * 1000);

            return url.hostname;
        } catch {
            return "doodstream.com";
        }
    }
}

const doodstream = new Doodstream();

export default doodstream;
