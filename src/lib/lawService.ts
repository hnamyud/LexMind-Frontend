import { apiClient } from "./apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LawNode {
    raw_text: string;
    id: string;
    label: string;
    text: string;
    source_file: string;
}

export interface LawDetailResponse {
    status: string;
    data: LawNode[];
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const lawService = {
    /**
     * GET /chat/law-detail/:nodeId
     * Lấy chi tiết điều luật theo nodeId (vd: d7_k8_a, dieu_7, ...)
     */
    async getLawDetail(nodeId: string): Promise<LawDetailResponse> {
        return apiClient.get<LawDetailResponse>(
            `/chat/law-detail/${encodeURIComponent(nodeId)}`,
            true
        );
    },
};

// ─── Helpers: chuyển đổi tham chiếu văn bản → nodeId ─────────────────────────

/**
 * Chuyển reference text dạng "[Điều 23, Khoản 1, Điểm n, ...]"
 * thành nodeId dạng "d23_k1_n".
 *
 * Hỗ trợ:
 * - Điều X          → dieu_X  (hoặc dX nếu có thêm khoản)
 * - Khoản Y         → kY
 * - Điểm Z          → z (giữ nguyên ký tự gốc, vd: đ → đ)
 */
export function refTextToNodeId(text: string): string | null {
    // Xoá dấu ngoặc vuông
    const clean = text.replace(/^\[|\]$/g, "").trim();

    let dieu: string | null = null;
    let khoan: string | null = null;
    let diem: string | null = null;

    // Tìm "Điều X"
    const dieuMatch = clean.match(/Điều\s+(\d+)/i);
    if (dieuMatch) dieu = dieuMatch[1];

    // Tìm "Khoản Y"
    const khoanMatch = clean.match(/Khoản\s+(\d+)/i);
    if (khoanMatch) khoan = khoanMatch[1];

    // Tìm "Điểm Z"
    const diemMatch = clean.match(/Điểm\s+([a-zA-Zđăâêôơư]+)/i);
    if (diemMatch) {
        diem = diemMatch[1].toLowerCase();
    }

    if (!dieu) return null;

    // Nếu chỉ có Điều → dieu_X
    let structure = "";
    if (!khoan && !diem) {
        structure = `dieu_${dieu}`;
    } else {
        structure = `d${dieu}`;
        if (khoan) structure += `_k${khoan}`;
        if (diem) structure += `_${diem}`;
    }

    let docRef: string | null = null;
    const lowerClean = clean.toLowerCase();
    if (lowerClean.includes("168/2024/nđ-cp") || lowerClean.includes("nghị định 168")) {
        docRef = "nd168_2024";
    } else if (
        lowerClean.includes("trật tự, an toàn") ||
        lowerClean.includes("trật tự an toàn") ||
        lowerClean.includes("luật trật tự") ||
        lowerClean.includes("36/2024/qh15") ||
        lowerClean.includes("luật số 36") ||
        lowerClean.includes("ttatgt")
    ) {
        docRef = "l36_2024";
    } else if (
        lowerClean.includes("35/2024/qh15") ||
        lowerClean.includes("luật số 35") ||
        lowerClean.includes("luật đường bộ") ||
        lowerClean.includes("luật đb")
    ) {
        docRef = "l35_2024";
    }

    if (docRef) {
        return `${docRef}_${structure}`;
    }

    return structure;
}
