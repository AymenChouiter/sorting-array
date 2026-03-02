/**
 * Helpers - Sorting Utilities
 * - Stateless helper functions used by the core sorting Model.
 * - Responsible for element swapping, partitioning, merging, coloring and basic checks.
 */

/**
 * Swaps two elements in the underlying array based on whoChangeFir and whoChangeSec.
 * @param {{arr:number[], whoChangeFir:number, whoChangeSec:number}} sortingState - Current mutable sorting state.
 * @returns {void}
 */
const swapElements = (sortingState) => {
    const temporaryValue = sortingState.arr[sortingState.whoChangeFir];
    sortingState.arr[sortingState.whoChangeFir] = sortingState.arr[sortingState.whoChangeSec];
    sortingState.arr[sortingState.whoChangeSec] = temporaryValue;
};

/**
 * Partitions a subarray around a pivot for Quick Sort.
 * Elements less than or equal to the pivot are moved to the left side.
 *
 * @param {{arr:number[], whoChangeFir:number, whoChangeSec:number}} sortingState - Current mutable sorting state.
 * @param {number} low - Lower index (inclusive) of the partition range.
 * @param {number} high - Upper index (inclusive) of the partition range.
 * @returns {number} Index at which the pivot element is finally placed.
 */
const partitionArraySegment = (sortingState, low, high) => {
    const pivotValue = sortingState.arr[high];
    let partitionIndex = low - 1;
    for (let currentIndex = low; currentIndex < high; currentIndex++) {
        if (sortingState.arr[currentIndex] <= pivotValue) {
            partitionIndex++;
            sortingState.whoChangeFir = partitionIndex;
            sortingState.whoChangeSec = currentIndex;
            swapElements(sortingState);
        }
    }
    sortingState.whoChangeFir = partitionIndex + 1;
    sortingState.whoChangeSec = high;
    swapElements(sortingState);
    return partitionIndex + 1;
};

/**
 * Merges two pre-sorted subarrays into a single sorted array.
 * Used by Merge Sort to combine sorted halves.
 *
 * @param {number[]} leftSubarray - Left sorted portion.
 * @param {number[]} rightSubarray - Right sorted portion.
 * @returns {number[]} New merged sorted array.
 */
const mergeSortedSubarrays = (leftSubarray, rightSubarray) => {
    const mergedArray = [];
    let leftIndex = 0;
    let rightIndex = 0;
    while (leftIndex < leftSubarray.length && rightIndex < rightSubarray.length) {
        if (leftSubarray[leftIndex] <= rightSubarray[rightIndex]) {
            mergedArray.push(leftSubarray[leftIndex++]);
        } else {
            mergedArray.push(rightSubarray[rightIndex++]);
        }
    }
    return mergedArray.concat(leftSubarray.slice(leftIndex)).concat(rightSubarray.slice(rightIndex));
};

/**
 * Applies highlight colors for the two indices involved in the current step.
 * @param {{color:string[], whoChangeFir:number, whoChangeSec:number}} sortingStep - Payload to be sent to the client.
 * @returns {void}
 */
const applyStepColors = (sortingStep) => {
    sortingStep.color[sortingStep.whoChangeFir] = '48bb78';
    sortingStep.color[sortingStep.whoChangeSec] = 'e53e3e';
};

/**
 * Builds a visualization-friendly payload from the current sorting state.
 * Optionally performs the swap first depending on the algorithm's needs.
 *
 * @param {{arr:number[], whoChangeFir:number, whoChangeSec:number, shouldSwapBeforeColoring:boolean}} sortingState
 *        Current state of the array and metadata for highlighting.
 * @returns {{arr:number[], whoChangeFir:number, whoChangeSec:number, color:string[]}}
 */
const buildStepFromSwap = (sortingState) => {
    if (sortingState.shouldSwapBeforeColoring) {
        swapElements(sortingState);
    }

    const stepPayload = {
        arr: sortingState.arr,
        whoChangeFir: sortingState.whoChangeFir,
        whoChangeSec: sortingState.whoChangeSec,
        color: [],
    };
    applyStepColors(stepPayload);
    return stepPayload;
};

/**
 * Checks whether the entire array is sorted in non-decreasing order.
 * Used as an early-exit optimization in Quick Sort.
 *
 * @param {number[]} array - Array to check.
 * @returns {boolean} True if the array is sorted, false otherwise.
 */
const isSorted = (array) => {
    for (let index = 0; index < array.length; index++) {
        if (array[index] > array[index + 1]) {
            return false;
        }
    }
    return true;
};

module.exports = {
    swapElements,
    partitionArraySegment,
    mergeSortedSubarrays,
    applyStepColors,
    buildStepFromSwap,
    isSorted,
};