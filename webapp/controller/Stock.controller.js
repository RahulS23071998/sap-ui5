sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Input",
    "jquery.sap.global",
], function (Controller, JSONModel, MessageToast, Dialog, Button, VBox, Label, Input, jQuery) {
    "use strict";

    var StockController = Controller.extend("ui5.walkthrough.controller.Stock", {
        onInit: function () {
            this.findAllStocks();
            this.initializeNewDataModel();
            this.initializeEditDataModel();
        },

        findAllStocks: function () {
            var that = this;

            jQuery.ajax({
                url: "http://localhost:8083/api/v2/stock",
                method: "GET",
                success: function (data) {
                    var oModel = new JSONModel(data);
                    that.getView().setModel(oModel, "dataModel");
                    MessageToast.show("Data loaded successfully!");
                },
                error: function (error) {
                    MessageToast.show("Error loading data: " + error.responseText);
                }
            });
        },

        initializeNewDataModel: function () {
            var oNewDataModel = new JSONModel({
                productQuantity: "",
                productCode: "",
                location: "",
                zipCode: ""
            });
            this.getView().setModel(oNewDataModel, "newDataModel");
        },

        initializeEditDataModel: function () {
            var oEditDataModel = new JSONModel({
                productQuantity: "",
                productCode: "",
                location: "",
                zipCode: ""
            });
            this.getView().setModel(oEditDataModel, "editDataModel");
        },

        onOpenFormPopupPress: function () {
            this.byId("newDataFormDialog").open();
        },

        onCloseFormPopupPress: function () {
            this.byId("newDataFormDialog").close();
        },

        onSubmitFormPress: function () {
            var oNewDataModel = this.getView().getModel("newDataModel").getData();

            jQuery.ajax({
                url: "http://localhost:8083/api/v2/stock/data",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(oNewDataModel),
                success: function () {
                    MessageToast.show("Data submitted successfully!");
                    this.findAllStocks();
                    this.onCloseFormPopupPress();
                }.bind(this),
                error: function (error) {
                    MessageToast.show("Error submitting data: " + error.responseText);
                }
            });
        },

        onDeleteRowPress: function (oEvent) {
            var oListItem = oEvent.getSource().getParent();
            var sPath = oListItem.getBindingContext("dataModel").getPath();
            var sStockId = this.getView().getModel("dataModel").getProperty(sPath + "/stockId");

            if (sStockId) {
                jQuery.ajax({
                    url: "http://localhost:8083/api/v2/stock/" + sStockId,
                    method: "DELETE",
                    success: function () {
                        MessageToast.show("Data deleted successfully!");
                        this.findAllStocks();
                    }.bind(this),
                    error: function (error) {
                        MessageToast.show("Error deleting data: " + error.responseText);
                    }
                });
            } else {
                MessageToast.show("No item selected for deletion.");
            }
        },

    onEditRowPress: function (oEvent) {
        var oListItem = oEvent.getSource().getParent();

        if (oListItem) {
            var sPath = oListItem.getBindingContext("dataModel").getPath();
            var oDataModel = this.getView().getModel("dataModel");
            var oEditData = oDataModel.getProperty(sPath);

            if (oEditData) {
                this.getView().getModel("editDataModel").setData(oEditData);
                this.byId("editDataFormDialog").open();
            } else {
                console.error("Error: Unable to retrieve data for editing.");
            }
        } else {
            console.error("Error: Parent ListItem not found.");
        }
    },
    onUpdateFormPress: function () {
            var oEditDataModel = this.getView().getModel("editDataModel").getData();
            var sStockId = oEditDataModel.stockId;

            // Perform PUT request with oEditDataModel data
            jQuery.ajax({
                url: "http://localhost:8083/api/v2/stock/" + sStockId,
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify(oEditDataModel),
                success: function () {
                    MessageToast.show("Data updated successfully!");
                    this.findAllStocks();
                    this.onCloseEditFormPopupPress();
                }.bind(this),
                error: function (error) {
                    MessageToast.show("Error updating data: " + error.responseText);
                }
            });
        },

        onCloseEditFormPopupPress: function () {
            this.byId("editDataFormDialog").close();
        }
    });

    return StockController;
});
