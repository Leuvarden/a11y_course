import $ from 'jquery'
import Menu from './Menu';
import KeyCode from './KeyCode';

export default class SelectableMenu extends Menu {
    constructor(containerId, items) {
        super(containerId, items);
    }

    _addMenuItems() {
        this.items.forEach((item, index) => {
            let $menuItem = $('<li class="text-center">' + item.text + '</li>');
            $menuItem.attr('role', 'menuitemcheckbox');
            $menuItem.attr('tabindex', '0');

            if (item.isSelected) {
                $menuItem.attr('aria-checked', 'true');
            } else {
                $menuItem.attr('aria-checked', 'false');
            }

            this.$widgetList.append($menuItem);
            this.$dropdownItems.push($menuItem);
        });

        this.$widgetList.click((e) => { this._handleSelect($(e.target)) })
    }

    _handleSelect($currentItem) {
        if ($currentItem.attr('aria-checked') == 'false') {
            $currentItem.attr('aria-checked', 'true');
        } else {
            $currentItem.attr('aria-checked', 'false');
        }
    }

    _handleKeydownOnDropdownItems(event) {
        let $currentItem = $(event.target);
        let $firstItem = this.$dropdownItems[0];
        let $lastItem = this.$dropdownItems[3];
        let $previousItem = $(event.target).prev();
        let $nextItem = $(event.target).next();

        switch (event.which) {
            case KeyCode.ENTER:
                this._handleSelect($currentItem);
                this.collapsePopup();
                break;
                case KeyCode.SPACE:
                event.preventDefault();
                this._handleSelect($currentItem);
                break;
            case KeyCode.ESCAPE:
                this.collapsePopup();
                break;
            case KeyCode.UP:
                event.preventDefault();
                if ($currentItem.is($firstItem)) {
                    $lastItem.focus();
                } else {
                    $previousItem.focus();
                }
                break;
            case KeyCode.DOWN:
                event.preventDefault();
                if ($currentItem.is($lastItem)) {
                    $firstItem.focus();
                } else {
                    $nextItem.focus();
                }
                break;
            case KeyCode.HOME:
                event.preventDefault();
                $firstItem.focus();
                break;
            case KeyCode.END:
                event.preventDefault();
                $lastItem.focus();
                break;
            case KeyCode.TAB:
                if (event.shiftKey) {
                    event.preventDefault();
                }

                this.collapsePopup();
                break;
        }
    }
}