/**
 * Merge the `src` event pattern into the `dest` event pattern by adding all
 * values from `src` into the fields in `dest`.
 *
 * See `rule.addEventPattern` for details.
 */
export function mergeEventPattern(dest: any, src: any) {
    dest = dest || { };

    mergeObject(dest, src);

    return dest;

    function mergeObject(destObj: any, srcObj: any) {
        if (typeof(srcObj) !== 'object') {
            throw new Error(`Invalid event pattern '${JSON.stringify(srcObj)}', expecting an object or an array`);
        }

        for (const field of Object.keys(srcObj)) {

            const srcValue = srcObj[field];
            const destValue = destObj[field];

            if (typeof(srcValue) !== 'object') {
                throw new Error(`Invalid event pattern field { ${field}: ${JSON.stringify(srcValue)} }. All fields must be arrays`);
            }

            // dest doesn't have this field
            if (!(field in destObj)) {
                destObj[field] = srcValue;
                continue;
            }

            if (Array.isArray(srcValue) !== Array.isArray(destValue)) {
                throw new Error(`Invalid event pattern field ${field}. ` +
                    `Type mismatch between existing pattern ${JSON.stringify(destValue)} and added pattern ${JSON.stringify(srcValue)}`);
            }

            // if this is an array, concat the values
            if (Array.isArray(srcValue)) {
                destObj[field] = destValue.concat(srcValue);
                continue;
            }

            // otherwise, it's an object, so recurse
            mergeObject(destObj[field], srcValue);
        }
    }
}