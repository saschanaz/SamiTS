module SamiTS.util {
    export function isEmptyOrEndsWithSpace(input: string) {
        return !input.length || input[input.length - 1] === ' ';
    }
    export function absorbSpaceEnding(input: string) {
        if (isEmptyOrEndsWithSpace(input))
            return input.slice(0, -1);
        else
            return input;
    }
}