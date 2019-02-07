import $ from 'jquery'
import KeyCode from './KeyCode';
import { template } from 'lodash';

import ieTemplate from './templates/ieTemplate.html'
import simpleMenu from './templates/simpleMenu.html'
import selectMenu from './templates/checkboxesMenu.html'
import Dialog from './templates/Dialog.html'
import Grid from './templates/grid.html'
import Table from './templates/table.html'
import List from './templates/recipientsList.html'

export  class ieSection {
    constructor(containerId) {
        this.$section = $('#' + containerId);
        this.draw();
    }

    draw() {
        this.$section.append(template(ieTemplate)({}))
    }
}

export class simpleMenuSection {
    constructor(containerId) {
        this.$section = $('#' + containerId);
        this.draw();
    }

    draw() {
        this.$section.append(template(simpleMenu)({}))
    }
}

export class selectMenuSection {
    constructor(containerId) {
        this.$section = $('#' + containerId);
        this.draw();
    }

    draw() {
        this.$section.append(template(selectMenu)({}))
    }
}

export class DialogSection {
    constructor(containerId) {
        this.$section = $('#' + containerId);
        this.draw();
    }

    draw() {
        this.$section.append(template(Dialog)({}))
    }
}

export class GridSection {
    constructor(containerId) {
        this.$section = $('#' + containerId);
        this.draw();
    }

    draw() {
        this.$section.append(template(Grid)({}))
    }
}

export class TableSection {
    constructor(containerId) {
        this.$section = $('#' + containerId);
        this.draw();
    }

    draw() {
        this.$section.append(template(Table)({}))
    }
}

export class PillSection {
    constructor(containerId) {
        this.$section = $('#' + containerId);
        this.draw();
    }

    draw() {
        this.$section.append(template(List)({}))
    }
}