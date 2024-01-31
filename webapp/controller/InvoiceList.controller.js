sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
    
], (Controller, JSONModel, formatter, Filter, FilterOperator,Sorter) => {
    "use strict";

    return Controller.extend("ui5.walkthrough.controller.InvoiceList", {
        formatter: formatter,
        onInit() {
            const oViewModel = new JSONModel({
                currency: "EUR"
            });
            this.getView().setModel(oViewModel, "view");
        },

        onFilterInvoices(oEvent) {
            // build filter array
            const aFilter = [];
            const sQuery = oEvent.getParameter("query");
            if (sQuery) {
                aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
            }

            // filter binding
            const oList = this.byId("invoiceList");
            const oBinding = oList.getBinding("items");
            oBinding.filter(aFilter);
        },

        onPress() {
            const oRouter = this.getOwnerComponent().getRouter();
            console.log(oRouter);
            oRouter.navTo("detail");
        },

        onDelete() {
            var sUserName;
            var oContext,
                oSelected = this.byId("invoiceList").getSelectedItem();
            console.log("Invoice List: " + oSelected);
            if (oSelected) {
                oContext = oSelected.getBindingContext();
                if(oContext){
                sUserName = oContext.getProperty("ProductName");
                }else{
                    console.error("oContext is undefined");
                }
                oContext.delete();
            }
        },

        onSort() {
            const oSorter = new Sorter();
            const aSorter = [];
            aSorter.push(oSorter);

            const oTable = this.byId("invoiceList");
            const oBinding = oList.getBinding("items");
            oBinding.sort(aSorter);
        }
    });
});