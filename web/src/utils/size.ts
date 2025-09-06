export function renderSize(value: number | string | null | undefined): string {
    if (value == null || value === '' || value === 0) {
        return "0 B";
    }

    const unitArr: string[] = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let srcSize: number = parseFloat(value as string);
    let index: number = Math.floor(Math.log(srcSize) / Math.log(1024));
    let size: number = srcSize / Math.pow(1024, index);
    size = parseFloat(size.toFixed(2));
    return size + ' ' + unitArr[index];
}
