import $ from 'jquery'
import KeyCode from './KeyCode';

export default class Menu {
    constructor(containerId, items) {
        this.items = items;
        this.$widgetContainer = $('#' + containerId);
        this.$dropdownItems = [];
    }

    drawMenu() {
        this.$widgetButton = $('<button>', {
            'class': "btn btn-lg btn-primary",
            'aria-haspopup': "true",
            'text': 'Menu button'
        })
        this.$widgetList = $('<ul>', {
            'role': 'menu',
            'aria-label': 'Default menu',
            'class': 'card-body bg-white list-unstyled px-2 py-1',
            'style': 'display: block;'
        });
        this.$widgetContainer.append(this.$widgetButton).append(this.$widgetList);

        this._addMenuItems();
        this._addEventListeners();
    }

    _addMenuItems() {
        this.items.forEach((item, index) => {
            let $menuItem = $('<li>', {
                'text': item.text,
                'class': 'my-2 pl-2 border-light border-bottom-0 border font-weight-bold'
            });
            $menuItem.attr('role', 'menuitem');
            $menuItem.attr('tabindex', '0');

            //IE specific fix
            //$menuItem.attr('aria-posinset', index+1);
            //$menuItem.attr('aria-setsize', this.items.length);

            this.$widgetList
                // .append('<span class="dropdown-divider">')
                .append($menuItem);
            this.$dropdownItems.push($menuItem);
        });
    }

    _addEventListeners() {
        this.$widgetButton.click(() => this.togglePopup())
        this.$widgetButton.keydown((event) => {
            let $firstItem = this.$dropdownItems[0];
            let $lastItem = this.$dropdownItems[3];

            switch (event.which) {

                case KeyCode.DOWN:
                    event.preventDefault();
                    if (!this.$widgetList.attr("aria-expanded")) {
                        this.expandPopup();
                        $firstItem.focus();
                    }
                    break;
                case KeyCode.UP:
                    event.preventDefault();
                    if (!this.$widgetList.attr("aria-expanded")) {
                        this.expandPopup();
                        $lastItem.focus();
                    }
                    break;
            }
        })

        this.$widgetList.keydown((e) => this._handleKeydownOnDropdownItems(e))
    }

    togglePopup() {
        if (this.$widgetList.attr("aria-expanded")) {
            this.collapsePopup();
            this.$widgetButton.focus();
        } else {
            this.expandPopup();
        }
    }

    expandPopup() {
        this.$widgetList.css("display", "block");
        this.$widgetList.attr("aria-expanded", "true");
        this.$widgetList
            .find("li")
            .eq(0)
            .focus();
    }

    collapsePopup() {
        this.$widgetList.css("display", "none");
        this.$widgetList.removeAttr("aria-expanded");
    }

    _handleKeydownOnDropdownItems(event) {
        let $currentItem = $(event.target);
        let $firstItem = this.$dropdownItems[0];
        let $lastItem = this.$dropdownItems[3];
        let $previousItem = $(event.target).prev();
        let $nextItem = $(event.target).next();

        switch (event.which) {
            case KeyCode.ENTER:
            case KeyCode.SPACE:
                this.collapsePopup();
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