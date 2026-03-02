/**
 * View Controller - SortingViewController
 * - Acts as the "Controller" between the DOM (View) and the backend sorting API.
 * - Manages user input, algorithm selection, and step-by-step visualization updates.
 */
class SortingViewController {
    /**
     * Creates a new SortingViewController and wires up DOM event handlers.
     */
    constructor() {
        this.inputArray = [];
        this.primaryChangedIndex = 0;
        this.secondaryChangedIndex = 0;
        this.elementColors = [];
        this.selectedAlgorithmName = "";

        // DOM references
        this.arrayDisplayElement = document.getElementById("array-visualizer");
        this.arrayInputElement = document.getElementById("array-input");
        this.indexElements = document.getElementsByClassName("index");
        this.commaElements = document.getElementsByClassName("comma");
        this.selectedAlgorithmChoiceElement = null;

        this.inputSectionElement = document.getElementsByClassName("inputs")[0];
        this.resultsContainerElement = document.getElementById("sorting-steps-container");
        this.resultsSectionElement = document.getElementById("sorting-result-section");
        this.sortingStepElements = document.getElementsByClassName("sorting-step");
        this.algorithmPickerElement = document.querySelector(".algo-picker");

        const algorithmPickerTriggerElement = document.querySelector(".algo-trigger");
        if (algorithmPickerTriggerElement) {
            algorithmPickerTriggerElement.addEventListener("click", (event) => {
                event.stopPropagation();
                this.algorithmPickerElement.classList.toggle("open");
                algorithmPickerTriggerElement.setAttribute(
                    "aria-expanded",
                    this.algorithmPickerElement.classList.contains("open")
                );
            });
            document.addEventListener("click", (event) => {
                if (this.algorithmPickerElement && !this.algorithmPickerElement.contains(event.target)) {
                    this.algorithmPickerElement.classList.remove("open");
                    algorithmPickerTriggerElement.setAttribute("aria-expanded", "false");
                }
            });
        }
    }

    /**
     * Adds the current numeric input value into the in-memory array
     * and updates the visual representation in the array viewer.
     * @returns {void}
     */
    addInputValueToArray() {
        if (!this.arrayInputElement.value) return;
        this.arrayDisplayElement.removeChild(this.arrayInputElement.parentElement);
        this.arrayDisplayElement.insertAdjacentHTML(
            "beforeend",
            `
            <span class="index">${this.arrayInputElement.value}</span>
            <span class="comma">,</span>
        `
        );

        this.inputArray.push(Number(this.arrayInputElement.value));
        this.elementColors.push("ccc");

        this.arrayDisplayElement.appendChild(this.arrayInputElement.parentElement);

        if (typeof this.arrayDisplayElement.scrollTo === "function") {
            this.arrayDisplayElement.scrollTo({
                left: this.arrayDisplayElement.scrollWidth,
                behavior: "smooth",
            });
        } else {
            this.arrayDisplayElement.scrollLeft = this.arrayDisplayElement.scrollWidth;
        }
        console.log(this.inputArray);
        this.arrayInputElement.value = "";
        this.arrayInputElement.focus();
    }

    /**
     * Removes the last value from the in-memory array and
     * synchronizes the DOM representation by removing the last index/comma pair.
     * @returns {void}
     */
    removeLastInputValue() {
        if (this.indexElements.length < 1 || this.arrayInputElement.value) return;

        this.arrayDisplayElement.removeChild(this.arrayInputElement.parentElement);
        this.arrayDisplayElement.removeChild(this.indexElements[this.indexElements.length - 1]);
        this.arrayDisplayElement.removeChild(this.commaElements[this.commaElements.length - 1]);
        this.arrayDisplayElement.appendChild(this.arrayInputElement.parentElement);
        if (typeof this.arrayDisplayElement.scrollTo === "function") {
            this.arrayDisplayElement.scrollTo({
                left: this.arrayDisplayElement.scrollWidth,
                behavior: "smooth",
            });
        } else {
            this.arrayDisplayElement.scrollLeft = this.arrayDisplayElement.scrollWidth;
        }

        this.inputArray.pop();
        console.log(this.inputArray);

        this.arrayInputElement.value = "";
        this.arrayInputElement.focus();
    }

    /**
     * Handles keyboard events on the numeric input field.
     * - Enter: appends a new value.
     * - Backspace (on empty input): removes the last value.
     * @param {KeyboardEvent} event - Keyboard event fired from the input.
     * @returns {void}
     */
    handleInputKeydown(event) {
        if (event.key === "Enter") {
            console.log("Enter key pressed!");
            this.addInputValueToArray();
        } else if (event.key === "Backspace") {
            console.log("delete key pressed!");
            this.removeLastInputValue();
        }
    }

    /**
     * Handles algorithm choice selection from the UI and
     * ensures only one algorithm is visually active.
     * @param {HTMLElement} choiceElement - The clicked choice element representing an algorithm.
     * @returns {void}
     */
    handleAlgorithmChoice(choiceElement) {
        if (this.selectedAlgorithmChoiceElement === choiceElement) {
            this.selectedAlgorithmChoiceElement.classList.toggle("choice-click");
            this.selectedAlgorithmChoiceElement = null;
            this.selectedAlgorithmName = "";
        } else if (!this.selectedAlgorithmChoiceElement) {
            this.selectedAlgorithmChoiceElement = choiceElement;
            this.selectedAlgorithmChoiceElement.classList.toggle("choice-click");
            this.selectedAlgorithmName = choiceElement.innerHTML.toLowerCase();
        } else {
            this.selectedAlgorithmChoiceElement.classList.toggle("choice-click");
            this.selectedAlgorithmChoiceElement = choiceElement;
            this.selectedAlgorithmChoiceElement.classList.toggle("choice-click");
            this.selectedAlgorithmName = choiceElement.innerHTML.toLowerCase();
        }
        if (this.algorithmPickerElement) {
            this.algorithmPickerElement.classList.remove("open");
            const trigger = this.algorithmPickerElement.querySelector(".algo-trigger");
            if (trigger) {
                trigger.textContent = choiceElement.textContent;
                trigger.setAttribute("aria-expanded", "false");
            }
        }
    }

    /**
     * Builds the configuration payload that will be sent to the backend
     * to drive the sorting visualizer.
     * @returns {{arr:number[], whoChangeFir:number, whoChangeSec:number, color:string[]}}
     */
    getSortingConfig() {
        return {
            arr: this.inputArray,
            whoChangeFir: this.primaryChangedIndex,
            whoChangeSec: this.secondaryChangedIndex,
            color: this.elementColors,
        };
    }

    /**
     * Entry point for running a sort from the UI.
     * - Validates input.
     * - Ensures an algorithm is selected.
     * - Transitions layout into "sorting" mode and streams updates from the server.
     * @returns {Promise<void>}
     */
    async startSorting() {
        if (!this.inputArray[0]) {
            alert("can't sort a empty array");
            console.log("erererre");

            return;
        }
        if (!this.selectedAlgorithmName) this.handleAlgorithmChoice(document.getElementsByClassName("choice")[0]);

        this.arrayDisplayElement.classList.add("sort-view");
        this.inputSectionElement.classList.add("inputs-sort-view");
        this.resultsContainerElement.classList.add("arrays-result-view");
        this.resultsSectionElement.classList.add("result-view");

        this.arrayInputElement.disabled = true;
        this.inputSectionElement.classList.add("inputs-disabled");

        this.resultsContainerElement.innerHTML = `<div class='sorting-step' id='sorting-step'></div>`;
        await this.sendSortingRequest(this.getSortingConfig());

        this.arrayInputElement.disabled = false;
        this.inputSectionElement.classList.remove("inputs-disabled");
    }

    /**
     * Opens a long-lived Server-Sent Events connection to the backend,
     * streaming intermediate sorting steps for visualization.
     * @param {{arr:number[], whoChangeFir:number, whoChangeSec:number, color:string[]}} sortingConfig
     *        Initial state of the array and metadata for highlighting.
     * @returns {void}
     */
    sendSortingRequest(sortingConfig) {
        const urlData = encodeURIComponent(JSON.stringify(sortingConfig));
        const eventSource = new EventSource(
            `https://sortarr.onrender.com/sort/${this.selectedAlgorithmName}?data=${urlData}`
        );

        eventSource.onmessage = (event) => {
            const newData = JSON.parse(event.data);

            if (newData.status === "done") {
                console.log("Sorting Finished!");
                eventSource.close();
                return;
            }

            this.displaySortingResponse(newData);
        };
    }

    /**
     * Renders a single sorting step snapshot into the DOM and
     * appends an empty container for the next step.
     * @param {{arr:number[], color:string[]}} responseData - Data for the current sorting step.
     * @returns {void}
     */
    displaySortingResponse(responseData) {
        this.sortingStepElements[this.sortingStepElements.length - 1].innerHTML = "<span class='array'>[</span>";
        for (let i = 0; i < responseData.arr.length; i++) {
            if (i !== responseData.arr.length - 1) {
                this.sortingStepElements[this.sortingStepElements.length - 1].innerHTML += `
                    <span class="array" style="color:#${responseData.color[i]};">${responseData.arr[i]}</span>
                    <span class="array">,</span>
                `;
            } else {
                this.sortingStepElements[this.sortingStepElements.length - 1].innerHTML += `
                    <span class="array" style="color:#${responseData.color[i]};">${responseData.arr[i]}</span>
                `;
            }
        }
        this.sortingStepElements[this.sortingStepElements.length - 1].innerHTML += "<span class='array'>]</span>";
        this.resultsContainerElement.innerHTML += `<div class='sorting-step' id='sorting-step'></div>`;
    }
}

// Global controller instance used by inline HTML handlers.
let sortingViewController = new SortingViewController();
