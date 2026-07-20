import * as React from "react";

export interface IComboboxFilter<T> {
    /** What the combobox's text input should currently show. */
    inputValue: string;
    /** Items narrowed down to match what's currently typed. */
    filteredItems: T[];
    /** Wire to the combobox's onChange. */
    onInputChange: (value: string) => void;
    /** Wire to onOptionSelect and onBlur, so the input reverts to showing the real selection once search ends. */
    endSearch: () => void;
}

/**
 * Lets a non-freeform (or multiselect) Combobox be searched by typed text, while still
 * reverting to showing the actual selected value once a pick is made or focus leaves.
 * Fluent's Combobox does not filter its own options by typed text, so callers must do it.
 */
export function useComboboxFilter<T>(items: T[], getSearchText: (item: T) => string, selectedDisplayValue: string): IComboboxFilter<T> {
    const [searchText, setSearchText] = React.useState<string | null>(null);
    const inputValue = searchText ?? selectedDisplayValue;
    const filteredItems = !searchText ? items : items.filter((item) => getSearchText(item).toLowerCase().includes(searchText.toLowerCase()));

    return {
        inputValue,
        filteredItems,
        onInputChange: setSearchText,
        endSearch: () => setSearchText(null),
    };
}
