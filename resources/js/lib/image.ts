/**
 * Build a bandwidth-friendly Cloudinary thumbnail by injecting URL transforms
 * (f_auto = best format, q_auto = auto quality, c_fill = crop) after /upload/.
 * Non-Cloudinary URLs are returned untouched.
 */
export function thumb(url: string, size = 96): string {
    const marker = '/upload/';
    const i = url.indexOf(marker);

    if (!url.includes('res.cloudinary.com') || i === -1) {
        return url;
    }

    return url.slice(0, i + marker.length) + `f_auto,q_auto,w_${size},h_${size},c_fill/` + url.slice(i + marker.length);
}

/** Initials placeholder for products without an image (max 2 chars). */
export function initials(name: string): string {
    const words = name.trim().split(/\s+/);

    return words
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}
