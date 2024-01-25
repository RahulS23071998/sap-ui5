sap.ui.define([
	"sap/ui/core/library"
] , function (coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	return {


		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},


		quantityState: function(iValue) {
			if (iValue === 0) {
				return ValueState.Error;
			} else if (iValue <= 10) {
				return ValueState.Warning;
			} else {
				return ValueState.Success;
			}
		}

	};

});