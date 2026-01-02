"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusSchema = exports.Status = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ViewerRecord = class ViewerRecord {
    userId;
    seenAt;
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ViewerRecord.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], ViewerRecord.prototype, "seenAt", void 0);
ViewerRecord = __decorate([
    (0, mongoose_1.Schema)()
], ViewerRecord);
const ViewerRecordSchema = mongoose_1.SchemaFactory.createForClass(ViewerRecord);
let Status = class Status {
    userId;
    mediaUrl;
    type;
    viewers;
    expiresAt;
    createdAt;
};
exports.Status = Status;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Status.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Status.prototype, "mediaUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['image', 'video'] }),
    __metadata("design:type", String)
], Status.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: { count: Number, list: [ViewerRecordSchema] }, default: { count: 0, list: [] } }),
    __metadata("design:type", Object)
], Status.prototype, "viewers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: { expireAfterSeconds: 0 } }),
    __metadata("design:type", Date)
], Status.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Status.prototype, "createdAt", void 0);
exports.Status = Status = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Status);
exports.StatusSchema = mongoose_1.SchemaFactory.createForClass(Status);
//# sourceMappingURL=status.schema.js.map