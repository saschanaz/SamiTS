module SamiTS.util {
    export function isEmptyOrEndsWithSpace(input: string) {
        return !input.length || input[input.length - 1] === ' ';
    }
    export function isEmptyOrEndsWithLinefeed(input: string) {
        return !input.length || input[input.length - 1] === '\n';
    }
    export function absorbSpaceEnding(input: string) {
        if (isEmptyOrEndsWithSpace(input))
            return input.slice(0, -1);
        else
            return input;
    }
    export function manageLastLine(input: string, preventEmptyLine: boolean) {
        if (isEmptyOrEndsWithLinefeed(input) && preventEmptyLine)
            return input + ' ';
        else
            return input;
    }
    export function assign<T>(target: T, ...sources: any[]) {
        if ((<any>Object).assign)
            return <T>((<any>Object).assign)(target, ...sources);

        for (let source of sources) {
            source = Object(source);
            for (let property in source) {
                (<any>target)[property] = source[property];
            }
        }
        return target;
    }
}