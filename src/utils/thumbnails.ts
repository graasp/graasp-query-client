import { buildS3FileUrl } from "../api/routes";
import { failOnError } from "../api/utils";

// eslint-disable-next-line import/prefer-default-export
export const getRequestBlob = async (data: Response, S3_FILES_HOST: string) => {
    if (data.headers.get("Content-Type")?.includes('application/json')) {
        const json = await data.json()
        const s3FileUrl = buildS3FileUrl(S3_FILES_HOST, json.key);
        const img = await fetch(s3FileUrl).then(failOnError)
        return img.blob()
    }

    // default
    return data.blob();
}
