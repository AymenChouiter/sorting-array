/**
 * Model - Sorting Algorithms
 * - Implements the core sorting algorithms and exposes them as methods
 *   that stream intermediate steps to the controller.
 * - Consumed by the controller via Server-Sent Events (SSE).
 */
const {
    swapElements,
    partitionArraySegment,
    mergeSortedSubarrays,
    applyStepColors,
    buildStepFromSwap,
    isSorted,
} = require('../utils/secondery');

/**
 * Encapsulates the mutable array being sorted and exposes
 * various algorithm implementations (bubble, selection, insertion, merge, quick).
 */
class SortingArrayProcessor {
    /**
     * Creates a new sorting processor from the initial configuration payload.
     * @param {{arr:number[], whoChangeFir:number, whoChangeSec:number, color:string[]}} sortingConfig
     *        Initial state sent by the frontend visualizer.
     */
    constructor(sortingConfig) {
        this.arr = sortingConfig.arr;
        this.whoChangeFir = sortingConfig.whoChangeFir;
        this.whoChangeSec = sortingConfig.whoChangeSec;
        this.shouldSwapBeforeColoring = true;
        console.log(`Created a new SortingArrayProcessor with array: ${this.arr}`);
    }

    /**
     * Bubble sort implementation that streams each swap as a visualization step.
     * @param {import('express').Response} response - SSE response used to write sorting steps.
     * @returns {void}
     */
    bubble(response) {
        const length = this.arr.length;
        for (let i = length - 1; i > 0; i--) {
            for (let j = 0; j < i; j++) {
                if (this.arr[j] > this.arr[j + 1]) {
                    this.whoChangeFir = j;
                    this.whoChangeSec = j + 1;
                    response.write(`data: ${JSON.stringify(buildStepFromSwap(this))}\n\n`);
                    console.log(this.arr + ' : ' + this.whoChangeFir + ' => ' + this.whoChangeSec);
                }
            }
        }
        response.write('data: {"status": "done"}\n\n');
    }

    /**
     * Selection sort implementation that highlights the current minimum element swap.
     * @param {import('express').Response} response - SSE response used to write sorting steps.
     * @returns {void}
     */
    selection(response) {
        const length = this.arr.length;
        for (let i = 0; i < length - 1; i++) {
            let minIndex = i;
            for (let j = i + 1; j < length; j++) {
                if (this.arr[j] < this.arr[minIndex]) {
                    minIndex = j;
                }
            }
            if (minIndex !== i) {
                this.whoChangeFir = i;
                this.whoChangeSec = minIndex;
                response.write(`data: ${JSON.stringify(buildStepFromSwap(this))}\n\n`);
                console.log(this.arr + ' : ' + this.whoChangeFir + ' => ' + this.whoChangeSec);
            }
        }
        response.write('data: {"status": "done"}\n\n');
    }

    /**
     * Insertion sort implementation that streams each insertion position change.
     * @param {import('express').Response} response - SSE response used to write sorting steps.
     * @returns {void}
     */
    insertion(response) {
        const length = this.arr.length;
        for (let i = 1; i < length; i++) {
            let currentValue = this.arr[i];
            let j = i - 1;

            while (j >= 0 && this.arr[j] > currentValue) {
                this.arr[j + 1] = this.arr[j];
                j--;
            }

            this.arr[j + 1] = currentValue;
            this.whoChangeFir = i;
            this.whoChangeSec = j + 1;
            this.shouldSwapBeforeColoring = false;
            response.write(`data: ${JSON.stringify(buildStepFromSwap(this))}\n\n`);
            console.log(this.arr + ' : ' + this.whoChangeFir + ' => ' + this.whoChangeSec);
        }
        response.write('data: {"status": "done"}\n\n');
    }

    /**
     * Merge sort implementation (top-down recursive).
     * - Recursively divides the array and merges sorted halves.
     * - Each merge step is streamed for visualization.
     *
     * @param {import('express').Response} response - SSE response used to write sorting steps.
     * @returns {void}
     */
    merge(response) {
        const mergeSortRange = (leftIndex, rightIndex) => {
            const rangeLength = rightIndex - leftIndex;

            // Base case: a single element (or empty) range is already sorted.
            if (rangeLength <= 1) return;

            const middleIndex = leftIndex + Math.floor(rangeLength / 2);
            // Recursively sort the left and right halves before merging.
            mergeSortRange(leftIndex, middleIndex);
            mergeSortRange(middleIndex, rightIndex);

            const leftSlice = this.arr.slice(leftIndex, middleIndex);
            const rightSlice = this.arr.slice(middleIndex, rightIndex);
            const mergedRange = mergeSortedSubarrays(leftSlice, rightSlice);

            // Overwrite the original range with the merged sorted values so the
            // visualizer sees the array as it is being rebuilt.
            for (let index = 0; index < mergedRange.length; index++) {
                this.arr[leftIndex + index] = mergedRange[index];
            }

            this.whoChangeFir = leftIndex;
            this.whoChangeSec = rightIndex - 1;
            this.shouldSwapBeforeColoring = false;
            response.write(`data: ${JSON.stringify(buildStepFromSwap(this))}\n\n`);
            console.log(this.arr + ' : ' + this.whoChangeFir + ' => ' + this.whoChangeSec);
        };
        mergeSortRange(0, this.arr.length);
        response.write('data: {"status": "done"}\n\n');
    }

    /**
     * Quick sort implementation using a recursive partition strategy.
     * - Uses partitionArraySegment to place the pivot and stream each major partitioning step.
     *
     * @param {import('express').Response} response - SSE response used to write sorting steps.
     * @returns {void}
     */
    quick(response) {
        /**
         * Recursively partitions the array around a pivot and sorts subranges.
         * We rely on the partition function to both perform swaps and expose
         * which indices changed so the visualizer can highlight them.
         *
         * @param {number} [low=0] - Lower bound index of the current subrange.
         * @param {number} high - Upper bound index of the current subrange.
         * @param {import('express').Response} expressResponse - Streaming response for SSE.
         * @param {SortingArrayProcessor} sortingInstance - Mutable sorting state shared across recursion.
         */
        function quickSortRecursive(low = 0, high, expressResponse, sortingInstance) {
            if (low < high) {
                const pivotIndex = partitionArraySegment(sortingInstance, low, high);

                // At this point the pivot is in its final position for this subrange,
                // so we only need to color the indices without performing another swap.
                sortingInstance.shouldSwapBeforeColoring = false;
                expressResponse.write(`data: ${JSON.stringify(buildStepFromSwap(sortingInstance))}\n\n`);
                console.log(
                    sortingInstance.arr +
                        ' : ' +
                        sortingInstance.whoChangeFir +
                        ' => ' +
                        sortingInstance.whoChangeSec
                );
                // Early exit once the overall array is sorted to avoid unnecessary recursion.
                if (isSorted(sortingInstance.arr)) return;
                quickSortRecursive(low, pivotIndex - 1, expressResponse, sortingInstance);
                quickSortRecursive(pivotIndex + 1, high, expressResponse, sortingInstance);
            }
        }
        quickSortRecursive(0, this.arr.length - 1, response, this);
        response.write('data: {"status": "done"}\n\n');
    }
}

module.exports = { SortingArrayProcessor };