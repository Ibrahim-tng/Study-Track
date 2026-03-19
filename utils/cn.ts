export function cn(...inputs: (string | undefined | null | boolean | { [key: string]: any })[]) {
    return inputs
        .filter(Boolean)
        .map((input) => {
            if (typeof input === "object") {
                return Object.entries(input!)
                    .filter(([_, value]) => value)
                    .map(([key]) => key)
                    .join(" ");
            }
            return input;
        })
        .join(" ");
}
