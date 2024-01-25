sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"mycompany/myapp/MyWorklistApp/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("mycompany.myapp.MyWorklistApp.controller.Worklist", {

		formatter: formatter,

		onInit : function () {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");


			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			this._oTable = oTable;
			this._aTableSearchState = [];

			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0,
				inStock: 0,
				shortage: 0,
				outOfStock: 0,
				countAll: 0
			});
			this.setModel(oViewModel, "worklistView");
			this._mFilters = {
				"inStock": [new Filter("UnitsInStock", FilterOperator.GT, 10)],
				"outOfStock": [new Filter("UnitsInStock", FilterOperator.LE, 0)],
				"shortage": [new Filter("UnitsInStock", FilterOperator.BT, 1, 10)],
				"all": []
			};


			oTable.attachEventOnce("updateFinished", function(){
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},
   
		onUpdateFinished : function (oEvent) {
			var sTitle,
				oTable = oEvent.getSource(),
				oViewModel = this.getModel("worklistView"),
				iTotalItems = oEvent.getParameter("total");

			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				this.getModel().read("/Products/$count", {
					success: function (oData) {
						oViewModel.setProperty("/countAll", oData);
					}
				});
				this.getModel().read("/Products/$count", {
					success: function (oData) {
						oViewModel.setProperty("/inStock", oData);
					},
					filters: this._mFilters.inStock
				});
				this.getModel().read("/Products/$count", {
					success: function(oData){
						oViewModel.setProperty("/outOfStock", oData);
					},
					filters: this._mFilters.outOfStock
				});
				this.getModel().read("/Products/$count", {
					success: function(oData){
						oViewModel.setProperty("/shortage", oData);
					},
					filters: this._mFilters.shortage
				});
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		onPress : function (oEvent) {
			this._showObject(oEvent.getSource());
		},


		onNavBack : function() {
			history.go(-1);
		},


		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {

				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("ProductName", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},


		onRefresh : function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		_showObject : function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ProductID")
			});
		},


		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},


		_showErrorMessage: function(sMsg) {
			MessageBox.error(sMsg, {
				styleClass: this.getOwnerComponent().getContentDensityClass()
			});
		},

		onQuickFilter: function(oEvent) {
			var oBinding = this._oTable.getBinding("items"),
				sKey = oEvent.getParameter("selectedKey");
			oBinding.filter(this._mFilters[sKey]);
		},


		_handleUnlistActionResult : function (sProductId, bSuccess, iRequestNumber, iTotalRequests){
			if (iRequestNumber === iTotalRequests) {
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("StockRemovedSuccessMsg", [iTotalRequests]));
			}
		},



		_handleReorderActionResult : function (sProductId, bSuccess, iRequestNumber, iTotalRequests){
			if (iRequestNumber === iTotalRequests) {
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("StockUpdatedSuccessMsg", [iTotalRequests]));
			}
		},



		onUnlistObjects: function() {
			var aSelectedProducts, i, sPath, oProduct, oProductId;

			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {
					oProduct = aSelectedProducts[i];
					oProductId = oProduct.getBindingContext().getProperty("ProductID");
					sPath = oProduct.getBindingContext().getPath();
					this.getModel().remove(sPath, {
						success : this._handleUnlistActionResult.bind(this, oProductId, true, i + 1, aSelectedProducts.length),
						error : this._handleUnlistActionResult.bind(this, oProductId, false, i + 1, aSelectedProducts.length)
					});
				}
			} else {
				this._showErrorMessage(this.getModel("i18n").getResourceBundle().getText("TableSelectProduct"));
			}
		},


		onUpdateStockObjects: function() {
			var aSelectedProducts, i, sPath, oProductObject;

			aSelectedProducts = this.byId("table").getSelectedItems();
			if (aSelectedProducts.length) {
				for (i = 0; i < aSelectedProducts.length; i++) {
					sPath = aSelectedProducts[i].getBindingContext().getPath();
					oProductObject = aSelectedProducts[i].getBindingContext().getObject();
					oProductObject.UnitsInStock += 10;
					this.getModel().update(sPath, oProductObject, {
						success : this._handleReorderActionResult.bind(this, oProductObject.ProductID, true, i + 1, aSelectedProducts.length),
						error : this._handleReorderActionResult.bind(this, oProductObject.ProductID, false, i + 1, aSelectedProducts.length)
					});
				}
			} else {
				this._showErrorMessage(this.getModel("i18n").getResourceBundle().getText("TableSelectProduct"));
			}
		}

	});

});