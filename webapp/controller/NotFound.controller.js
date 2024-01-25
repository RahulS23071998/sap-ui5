sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("mycompany.myapp.MyWorklistApp.controller.NotFound", {

		onLinkPressed : function () {
			this.getRouter().navTo("worklist");
		}

	});

});