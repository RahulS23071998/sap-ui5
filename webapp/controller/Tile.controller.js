sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.Tile", {
        onPress() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("overview");
        },

        onStockPress() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("stockOverview");
        }
    });
});