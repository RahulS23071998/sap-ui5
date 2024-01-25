sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel",
   "sap/m/MessageToast",
   "sap/m/MessageBox",
   "jquery.sap.global"
], function (Controller, JSONModel, MessageToast, MessageBox, jQuery) {
   "use strict";

   var StockController = Controller.extend("mycompany.myapp.MyWorklistApp.controller.Stock", {
      onInit: function () {
         this.findAllStocks();
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
   });

   return StockController;
});
