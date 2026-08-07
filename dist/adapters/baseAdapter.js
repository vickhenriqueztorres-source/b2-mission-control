"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAdapter = void 0;
class BaseAdapter {
    name;
    constructor(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
}
exports.BaseAdapter = BaseAdapter;
