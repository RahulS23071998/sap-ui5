sap.ui.define([
	"sap/ui/test/Opa5",
	"mycompany/myapp/MyWorklistApp/localService/mockserver",
	"sap/ui/model/odata/v2/ODataModel"
], function(Opa5, mockserver, ODataModel) {
	"use strict";

	return Opa5.extend("mycompany.myapp.MyWorklistApp.test.integration.arrangements.Startup", {

		iStartMyApp : function (oOptionsParameter) {
			var oOptions = oOptionsParameter || {};

			this._clearSharedData();

			oOptions.delay = oOptions.delay || 1;

			var oMockserverInitialized = mockserver.init(oOptions);

			this.iWaitForPromise(oMockserverInitialized);
			this.iStartMyUIComponent({
				componentConfig: {
					name: "mycompany.myapp.MyWorklistApp",
					async: true
				},
				hash: oOptions.hash,
				autoWait: oOptions.autoWait
			});
		},

		iRestartTheAppWithTheRememberedItem : function (oOptions) {
			var sObjectId;
			this.waitFor({
				success : function () {
					sObjectId = this.getContext().currentItem.id;
				}
			});

			return this.waitFor({
				success : function() {
					oOptions.hash = "Products/" + encodeURIComponent(sObjectId);
					this.iStartMyApp(oOptions);
				}
			});
		},

		_clearSharedData: function () {
			ODataModel.mSharedData = { server: {}, service: {}, meta: {} };
		}

	});

});
