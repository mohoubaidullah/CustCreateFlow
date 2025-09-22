//var Workitem_id = "";
var Temp_ID = "";
var currentUser = "";
var signed_by = "";
var ApprovalLvl = "";
var violationTypeAr = "";
var violationTypeEn = "";
sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/BindingMode",
		"sap/ui/core/message/Message",
		"sap/ui/core/MessageType",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/core/library",
		"sap/ui/core/Fragment",
		'sap/ui/model/Filter',
		"../model/formatter"
	],

	function (Controller, JSONModel, BindingMode, Message, MessageType, MessageToast, MessageBox, library, Fragment, Filter, formatter) {
		"use strict";

		return Controller.extend("Cust.CustCreateFlow.controller.View1", {
			formatter: formatter,
			onInit: function () {
				var oMessageManager, oView;
				if (window.sap.ushell && window.sap.ushell.Container) {
					currentUser = window.sap.ushell.Container.getUser().getId();
				}
				oView = this.getView();
				oMessageManager = sap.ui.getCore().getMessageManager();
				oView.setModel(oMessageManager.getMessageModel(), "message");
				var string = "";
				var complete_url = window.location.href;
				//var pieces = complete_url.split("?");
				var pieces = complete_url.split("ccc");
				if (pieces.length === 2) {
					string = pieces[1];
					Temp_ID = string.substr(1, 10);
				}

				var onView = {
					allowEdit: false,
					EditButton: true,
					SaveButton: false,
					comment: false,
					CreditLimit: false
				};

				this.oLocalModel = new sap.ui.model.json.JSONModel(onView);
				this.oLocalModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
				oView.setModel(this.oLocalModel, "localModel");

				var oModel = this.getView().getModel();
				oModel.setHeaders({
					"X-Requested-With": "X"
				});
				if (Temp_ID !== null || Temp_ID !== "") {
					var sPath = "/customerDetailsSet('" + Temp_ID + "')";
					var that = this;
					oModel.read(sPath, {
						// urlParameters: {
						// 	"$filter": filter_string
						// },
						success: function (oData1, response) {
							// oData1.zdate = oData1.zdate ? oData1.zdate.toDateString() : null;
							oData1.url = "https://maps.google.com/?q=" + oData1.Latitude + "," + oData1.Longitude;
							if (oData1.zpayTerm === "2") {
								that.getView().getModel("localModel").setProperty("/CreditLimit", true);
							}
							// oData1.ztime = oData1.ztime ? new Date(oData1.ztime.ms).toISOString().slice(11, -5) : null;
							// oData1.UpdatedTIme = oData1.UpdatedTIme ? new Date(oData1.UpdatedTIme.ms).toISOString().slice(11, -5) : null;
							// var resourceBundle = that.getView().getModel("i18n").getResourceBundle();
							// oData1.MessageBinding = resourceBundle.getText(oData1.CurrentApproval ? oData1.CurrentApproval : "OTHR");
							var oModel3 = new sap.ui.model.json.JSONModel(oData1);
							//oData1.SalesOfficeText  =

							var osf = that.getView().byId("IdCustomerDetails");
							osf.setModel(oModel3);
							that.getHistory(Temp_ID);

						},
						error: function (error) {
							// that.getView().getModel("localModel").setProperty("/SubmitRequestVisible", false);
							sap.m.MessageToast.show("No Data retreived");
						}
					});
				}

			},
			handleFile: function (oEvent) {

				sap.m.MessageToast.show("File Size exceeds 2 MB Size, Please uploade below 2 MB File");
			},
			onChange: function (oEvent) {
				// MessageToast.show("change event fired! \n Selected Item id: " + oEvent.getParameters().selectedItem.sId
				// + "\n Previously Selected Item id: " + oEvent.getParameters().previousSelectedItem.sId);
				var payform = this.getView().byId("idPay").getSelectedKey();
				if (payform === "1") {
					this.getView().getModel("localModel").setProperty("/CreditLimit", false);

				} else if (payform === "2") {
					this.getView().getModel("localModel").setProperty("/CreditLimit", true);
				}

			},
			onViewHistory: function (oEvent) {
				var oView = this.getView();
				var oDialog = oView.byId("idHistoryView");
				// create dialog lazily
				if (!oDialog) {
					// create dialog via fragment factory
					// var oModel2 = new sap.ui.model.json.JSONModel(oData1);
					// var osf2 = that.byId("IdCommentsDetails");
					// osf2.setModel(oModel2);
					oDialog = sap.ui.xmlfragment(oView.getId(), "Cust.CustCreateFlow.fragments.History", this);
					// connect dialog to view (models, lifecycle)
					oView.addDependent(oDialog);
				}
				oDialog.open();
			},
			getHistory: function (ztempId) {
				var oModel = this.getView().getModel();
				oModel.setHeaders({
					"X-Requested-With": "X"
				});
				var temp = "" + ztempId + "";
				var myFilter = new sap.ui.model.Filter("Ztempid", sap.ui.model.FilterOperator.EQ, (temp).toString());
				// var oFilter = new Filter(
				// 	"Ztempid",
				// 	sap.ui.model.FilterOperator.Equal, ztempId
				// );
				var sPath = "/HistorySet"; //?$filter=Ztempid eq '" + ztempId + "'";
				var that = this;
				oModel.read(sPath, {
					filters: [myFilter],
					success: function (OData, response) {
						// debugger;
						var oView;
						oView = that.getView();
						for (let i = 0; i < OData.results.length; i++) {
							OData.results[i].Zdate = OData.results[i].Zdate.toDateString();
							OData.results[i].Ztime = OData.results[i].Ztime ? new Date(OData.results[i].Ztime.ms).toISOString().slice(11, -5) : null;
						}
						that.oLocalModel = new sap.ui.model.json.JSONModel(OData);
						that.oLocalModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
						oView.setModel(that.oLocalModel, "historyModel");
					},
					error: function () {
						sap.m.MessageToast.show("No Data retreived For Approval History");
					}
				});
			},
			formatterLevel: function (appStatus) {
				switch (appStatus) {
				case "S":
					return "Supervisor";
				case "R":
					return "Regional manager";
				case "C":
					return "Credit Control";
				case "W":
					return "Workflow User"
				}
			},
			formatterStatus: function (status) {
				switch (status) {
				case "P":
					return "Pending";
				case "I":
					return "In Progress";
				case "A":
					return "Approved";
				case "R":
					return "Rejected";
				case "E":
					return "Error";
				case "N":
					return "Not Applicable";
				default:
					return status;
				}
			},
			onPressBarCloseBtn: function (oEvent) {
				this.displayContent.close();
				this.fragOpen = undefined;
			},
			onViewVAT: function (oEvent) {

				var Zftype = 'VAT';

				if (Zftype !== "") {
					//call SAP and get file data
					var that = this;
					var oModel = that.getOwnerComponent().getModel();
					var sPath = "/CustomerAttachmentSet(ztempid=" + "'" + Temp_ID + "'" + ",Type=" + "'" + Zftype + "'" + ")";
					oModel.setHeaders({
						"X-Requested-With": "X"
					});
					oModel.read(sPath, {
						success: function (oData, response) {
							//var oModel3 = new sap.ui.model.json.JSONModel(oData);
							var fMres = oData.Content;
							var fType = "image/jpeg";
							var fName = "VAT.jpeg";

							if (oData.Mimetype && (oData.Mimetype !== "" || oData.Mimetype !== " ")) {
								fType = oData.Mimetype;
							}
							if (oData.FileName && (oData.FileName !== "" || oData.FileName !== " ")) {
								fName = oData.FileName;
							}

							fMres = "data:" + fType + ";base64," + fMres;

							if (!that.displayContent) {
								that.displayContent = sap.ui.xmlfragment("Cust.CustCreateFlow.fragments.filepreview", that);
								that.getView().addDependent(that.displayContent);
							}

							var splitTest = fType.split("/");
							var mimType = splitTest[0];
							var fType = fName.split(".");
							var fileType = fType[1];

							switch (mimType) {
							case 'image':
								sap.ui.getCore().byId("idPdfViewer").setVisible(false);
								sap.ui.getCore().byId("image").setVisible(true);
								sap.ui.getCore().byId("image").setSrc(fMres);
								break;
							default:
								sap.ui.getCore().byId("idPdfViewer").setVisible(true);
								sap.ui.getCore().byId("image").setVisible(false);
								var html = sap.ui.getCore().byId("idPdfViewer");
								html.setContent('<iframe src="' + fMres +
									'" embedded="true" frameborder="0" target="_top" width="2000px" height="2000px"></iframe>');
								break;
							}

							if (fileType !== "docx" && fileType !== "pub" && fileType !== "xls" && fileType !== "ppt" && fileType !== "doc" && fileType !==
								"xlsx") {
								that.displayContent.open();
								that.fragOpen = true;
							}
							if (that.fragOpen === undefined) {
								window.open(fMres, "_self");
								fMres = fMres.replace("data:APPLICATION/WWI;base64,", "");
							}

							//	this.displayContent.open();

						},
						error: function () {

							sap.m.MessageToast.show("No Data retreived");
						}

					});
				}

			},
			onlyNumber: function (oEvent) {
				var value = oEvent.getSource().getValue().replace(/[^\d]/g, '');
				oEvent.getSource().setValue(value);
			},
			onViewShop: function (oEvent) {

				var Zftype = 'SHP';

				if (Zftype !== "") {
					//call SAP and get file data
					var that = this;
					var oModel = that.getOwnerComponent().getModel();
					var sPath = "/CustomerAttachmentSet(ztempid=" + "'" + Temp_ID + "'" + ",Type=" + "'" + Zftype + "'" + ")";
					oModel.setHeaders({
						"X-Requested-With": "X"
					});
					oModel.read(sPath, {
						success: function (oData, response) {
							//var oModel3 = new sap.ui.model.json.JSONModel(oData);
							var fMres = oData.Content;
							var fType = "image/jpeg";
							var fName = "Shop.jpeg";
							if (oData.Mimetype && (oData.Mimetype !== "" || oData.Mimetype !== " ")) {
								fType = oData.Mimetype;
							}
							if (oData.FileName && (oData.FileName !== "" || oData.FileName !== " ")) {
								fName = oData.FileName;
							}

							fMres = "data:" + fType + ";base64," + fMres;

							if (!that.displayContent) {
								that.displayContent = sap.ui.xmlfragment("Cust.CustCreateFlow.fragments.filepreview", that);
								that.getView().addDependent(that.displayContent);
							}

							var splitTest = fType.split("/");
							var mimType = splitTest[0];
							var fType = fName.split(".");
							var fileType = fType[1];

							switch (mimType) {
							case 'image':
								sap.ui.getCore().byId("idPdfViewer").setVisible(false);
								sap.ui.getCore().byId("image").setVisible(true);
								sap.ui.getCore().byId("image").setSrc(fMres);
								break;
							default:
								sap.ui.getCore().byId("idPdfViewer").setVisible(true);
								sap.ui.getCore().byId("image").setVisible(false);
								var html = sap.ui.getCore().byId("idPdfViewer");
								html.setContent('<iframe src="' + fMres +
									'" embedded="true" frameborder="0" target="_top" width="2000px" height="2000px"></iframe>');
								break;
							}

							if (fileType !== "docx" && fileType !== "pub" && fileType !== "xls" && fileType !== "ppt" && fileType !== "doc" && fileType !==
								"xlsx") {
								that.displayContent.open();
								that.fragOpen = true;
							}
							if (that.fragOpen === undefined) {
								window.open(fMres, "_self");
								fMres = fMres.replace("data:APPLICATION/WWI;base64,", "");
							}

							//	this.displayContent.open();

						},
						error: function () {

							sap.m.MessageToast.show("No Data retreived");
						}

					});
				}

			},
			onViewCR: function (oEvent) {

				var Zftype = 'CR';

				if (Zftype !== "") {
					//call SAP and get file data
					var that = this;
					var oModel = that.getOwnerComponent().getModel();
					var sPath = "/CustomerAttachmentSet(ztempid=" + "'" + Temp_ID + "'" + ",Type=" + "'" + Zftype + "'" + ")";
					oModel.setHeaders({
						"X-Requested-With": "X"
					});
					oModel.read(sPath, {
						success: function (oData, response) {
							//var oModel3 = new sap.ui.model.json.JSONModel(oData);
							var fMres = oData.Content;
							var fType = "image/jpeg";
							var fName = "CR.jpeg";
							if (oData.Mimetype && (oData.Mimetype !== "" || oData.Mimetype !== " ")) {
								fType = oData.Mimetype;
							}
							if (oData.FileName && (oData.FileName !== "" || oData.FileName !== " ")) {
								fName = oData.FileName;
							}

							fMres = "data:" + fType + ";base64," + fMres;

							if (!that.displayContent) {
								that.displayContent = sap.ui.xmlfragment("Cust.CustCreateFlow.fragments.filepreview", that);
								that.getView().addDependent(that.displayContent);
							}

							var splitTest = fType.split("/");
							var mimType = splitTest[0];
							var fType = fName.split(".");
							var fileType = fType[1];

							switch (mimType) {
							case 'image':
								sap.ui.getCore().byId("idPdfViewer").setVisible(false);
								sap.ui.getCore().byId("image").setVisible(true);
								sap.ui.getCore().byId("image").setSrc(fMres);
								break;
							default:
								sap.ui.getCore().byId("idPdfViewer").setVisible(true);
								sap.ui.getCore().byId("image").setVisible(false);
								var html = sap.ui.getCore().byId("idPdfViewer");
								html.setContent('<iframe src="' + fMres +
									'" embedded="true" frameborder="0" target="_top" width="2000px" height="2000px"></iframe>');
								break;
							}

							if (fileType !== "docx" && fileType !== "pub" && fileType !== "xls" && fileType !== "ppt" && fileType !== "doc" && fileType !==
								"xlsx") {
								that.displayContent.open();
								that.fragOpen = true;
							}
							if (that.fragOpen === undefined) {
								window.open(fMres, "_self");
								fMres = fMres.replace("data:APPLICATION/WWI;base64,", "");
							}

							//	this.displayContent.open();

						},
						error: function () {

							sap.m.MessageToast.show("No Data retreived");
						}

					});
				}

			},
			onValueHelpSearchDivision: function (oEvent) {
				var sValue = oEvent.getParameter("value");

				var oFilter = new Filter(
					"DivisionKey",
					sap.ui.model.FilterOperator.Contains, sValue
				);

				oEvent.getSource().getBinding("items").filter([oFilter]);
			},
			onValueHelpCloseDivision: function (oEvent) {
				this.DivisionName = "";
				var that = this;
				var oSelectedItem = oEvent.getParameter("selectedItem");
				if (oSelectedItem) {
					var productInput = this.byId(this.inputId);
					productInput.setValue(oSelectedItem.getTitle());
					that.DivisionName = oSelectedItem.getDescription();
					that.onEnterDivisionID();
				}
				oEvent.getSource().getBinding("items").filter([]);
			},
			handleValueHelpDivision: function (oEvent) {
				var sInputValue = oEvent.getSource().getValue();

				this.inputId = oEvent.getSource().getId();
				// create value help dialog
				if (!this._valueHelpDialogDivision) {
					this._valueHelpDialogDivision = sap.ui.xmlfragment(
						"Cust.CustCreateFlow.fragments.ValueHelpDivision",
						this
					);
					this.getView().addDependent(this._valueHelpDialogDivision);
				}

				// create a filter for the binding
				this._valueHelpDialogDivision.getBinding("items").filter([new Filter(
					"DivisionKey",
					sap.ui.model.FilterOperator.Contains, sInputValue
				)]);
				// open value help dialog filtered by the input value
				this._valueHelpDialogDivision.open(sInputValue);
			},
			onEnterDivisionID: function (oEvent) {

			},
			onCloseHistory: function (oEvent) {
				// note: We don't need to chain to the pDialog promise, since this event-handler
				// is only called from within the loaded dialog itself.
				this.byId("idHistoryView").close();
			},
			onCloseDialog: function (oEvent) {
				// note: We don't need to chain to the pDialog promise, since this event-handler
				// is only called from within the loaded dialog itself.
				this.byId("idCommentsView").close();
			},

			onEdit: function (oEvent) {

				this.getView().getModel("localModel").setProperty("/allowEdit", true);
				this.getView().getModel("localModel").setProperty("/SaveButton", true);
				//this.getView().getModel("localModel").setProperty("/DigitalSignButton", false);
				this.getView().getModel("localModel").setProperty("/EditButton", false);
			},
			handleLoadItems: function (oControlEvent) {
				oControlEvent.getSource().getBinding("items").resume();
			},
			handleValueHelp: function (oEvent) {
				var sInputValue = oEvent.getSource().getValue();

				this.inputId = oEvent.getSource().getId();
				// create value help dialog
				if (!this._valueHelpDialog) {
					this._valueHelpDialog = sap.ui.xmlfragment(
						"Cust.CustCreateFlow.fragments.Dialog",
						this
					);
					this.getView().addDependent(this._valueHelpDialog);
				}

				// create a filter for the binding
				if (sInputValue === "") {
					sInputValue = 'P';
				}
				this._valueHelpDialog.getBinding("items").filter([new Filter(
					"PresellerId",
					sap.ui.model.FilterOperator.Contains, sInputValue
				)]);

				// open value help dialog filtered by the input value
				this._valueHelpDialog.open(sInputValue);
			},
			_handleValueHelpSearch: function (evt) {
				var sValue = evt.getParameter("value");
				if (sValue === "") {
					sValue = 'P';
				}
				var oFilter = new Filter(
					"PresellerId",
					sap.ui.model.FilterOperator.Contains, sValue
				);

				evt.getSource().getBinding("items").filter([oFilter]);
			},

			_handleValueHelpClose: function (evt) {
				this.name = "";
				var that = this;
				var oSelectedItem = evt.getParameter("selectedItem");
				if (oSelectedItem) {
					var productInput = this.byId(this.inputId);
					productInput.setValue(oSelectedItem.getTitle());
					that.name = oSelectedItem.getDescription();
					that.onEnterEmpID();
				}
				evt.getSource().getBinding("items").filter([]);
			},
			onSaveRequest: function (oEvent) {
				var tempID = this.getView().byId("idTempId").getText();
				var nameAr1 = this.getView().byId("idNameAr1").getValue();
				if (nameAr1 === "" || nameAr1 === " ") {
					//"Error"
					this.getView().byId('idNameAr1').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Arabic Name of Customer Correctly");
					return;
				} else {
					this.getView().byId('idNameAr1').setValueState(sap.ui.core.ValueState.None);
				}

				var nameAr2 = this.getView().byId("idNameAr2").getValue();
				var nameAr3 = this.getView().byId("idNameAr3").getValue();
				var nameEn = this.getView().byId("idNameEn").getValue();
				if (nameEn === "" || nameEn === " ") {
					//"Error"
					this.getView().byId('idNameEn').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter English Name of Customer Correctly");
					return;
				} else {
					this.getView().byId('idNameEn').setValueState(sap.ui.core.ValueState.None);
				}

				var email = this.getView().byId("idEmail").getValue();
				var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (!mailregex.test(email) && email !== "") {
					//"Error"
					this.getView().byId('idEmail').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer Email Correctly");
					return;
				}
				var payform = this.getView().byId("idPay").getSelectedKey();
				var creditLimit = this.getView().byId("idCreditLimit").getValue();
				if (payform === "2" && (creditLimit.length > 4 || Number(creditLimit) > 5000)) {
					//"Error"
					this.getView().byId('idCreditLimit').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer Credit Limit max is 5000 Correctly");
					return;
				} else {
					this.getView().byId('idCreditLimit').setValueState(sap.ui.core.ValueState.None);
				}
				var mobile = this.getView().byId("idMobile").getValue();
				if (mobile === "" || mobile === " " || mobile.length < 10) {
					//"Error"
					this.getView().byId('idMobile').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer Mobile Number Correctly");
					return;
				} else {
					this.getView().byId('idMobile').setValueState(sap.ui.core.ValueState.None);
				}
				var alt_mob = this.getView().byId("idAltMobile").getValue();
				var vat = this.getView().byId("idVAT").getValue();
				if ((vat !== "" && vat !== " ") && vat.length !== 15) {
					//"Error"
					this.getView().byId('idVAT').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer VAT Number Correctly");
					return;
				} else {
					this.getView().byId('idVAT').setValueState(sap.ui.core.ValueState.None);
				}

				var cr = this.getView().byId("idCR").getValue();
				if (cr === "" || cr === " ") {
					//"Error"
					this.getView().byId('idCR').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer CR Number Correctly");
					return;
				} else {
					this.getView().byId('idCR').setValueState(sap.ui.core.ValueState.None);
				}

				var building = this.getView().byId("idBuild").getValue();
				if (building === "" || building === " ") {
					//"Error"
					this.getView().byId('idBuild').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer Building Number Correctly");
					return;
				} else {
					this.getView().byId('idBuild').setValueState(sap.ui.core.ValueState.None);
				}

				var street = this.getView().byId("idStreet").getValue();
				if (street === "" || street === " ") {
					//"Error"
					this.getView().byId('idStreet').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer Street Correctly");
					return;
				} else {
					this.getView().byId('idStreet').setValueState(sap.ui.core.ValueState.None);
				}

				var district = this.getView().byId("idDistrict").getValue();
				if (district === "" || district === " ") {
					//"Error"
					this.getView().byId('idDistrict').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer district Correctly");
					return;
				} else {
					this.getView().byId('idDistrict').setValueState(sap.ui.core.ValueState.None);
				}

				var city = this.getView().byId("idCity").getValue();
				if (city === "" || city === " ") {
					//"Error"
					this.getView().byId('idCity').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer city Correctly");
					return;
				} else {
					this.getView().byId('idCity').setValueState(sap.ui.core.ValueState.None);
				}

				var pd = this.getView().byId("idpd").getValue();
				if (pd === "" || pd === " " || pd.length < 5) {
					//"Error"
					this.getView().byId('idpd').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer Postal Code Correctly");
					return;
				} else {
					this.getView().byId('idpd').setValueState(sap.ui.core.ValueState.None);
				}

				var shoplic = this.getView().byId("idShopLic").getValue();
				if (shoplic === "" || shoplic === " ") {
					//"Error"
					this.getView().byId('idShopLic').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer Shop Licence Correctly");
					return;
				} else {
					this.getView().byId('idShopLic').setValueState(sap.ui.core.ValueState.None);
				}
				var DelvRoute = this.getView().byId("idDeliveryRoute").getValue();
				// if (DelvRoute === "" || DelvRoute === " " || DelvRoute.length <= 5) {
				// 	//"Error"
				// 	this.getView().byId('idDeliveryRoute').setValueState(sap.ui.core.ValueState.Error);
				// 	sap.m.MessageToast.show("Please enter Customer Delviery Route Correctly");
				// 	return;
				// } else {
				// 	this.getView().byId('idDeliveryRoute').setValueState(sap.ui.core.ValueState.None);
				// }
				var route = this.getView().byId("idRoute").getValue();
				if (route === "" || route === " " || route.length <= 5) {
					//"Error"
					this.getView().byId('idRoute').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer Route Correctly");
					return;
				} else {
					this.getView().byId('idRoute').setValueState(sap.ui.core.ValueState.None);
				}
				var division = this.getView().byId("idDivison").getValue();
				if (division === "" || division === " ") {
					//"Error"
					this.getView().byId('idDivison').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Customer Division Correctly");
					return;
				} else {
					this.getView().byId('idDivison').setValueState(sap.ui.core.ValueState.None);
				}
				var visitFrequency = this.getView().byId("idVisitFreq").getValue();
				var visitDay = this.getView().byId("idVisitDay").getSelectedKey();

				var preseller = this.getView().byId("idPreseller").getValue();
				if (preseller === "" || preseller === " " || preseller.length <= 5) {
					//"Error"
					this.getView().byId('idPreseller').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter Preseller Correctly");
					return;
				} else {
					this.getView().byId('idPreseller').setValueState(sap.ui.core.ValueState.None);
				}
				// if (payform === "" || payform === " " ) {
				// 	//"Error"
				// 	this.getView().byId('idPreseller').setValueState(sap.ui.core.ValueState.Error);
				// 	sap.m.MessageToast.show("Please enter Customer Division Correctly");
				// 	return;
				// }
				debugger;
				var comment = this.getView().byId("idComments").getValue();
				var oFileUploader = " ";
				var cr_exp_date = this.getView().byId("idCRExpDate").getDateValue();
				if (cr_exp_date !== null) {
					var newDate = new Date(cr_exp_date)
				}
				var cr_from_date = this.getView().byId("idCRFromDate").getDateValue();
				if (cr_from_date !== null) {
					var newDateFrom = new Date(cr_from_date)
				}
				if ((cr_exp_date !== null && cr_from_date === null) || (cr_exp_date === null && cr_from_date !== null) || cr_from_date >=
					cr_exp_date) {
					//"Error"
					this.getView().byId('idCRFromDate').setValueState(sap.ui.core.ValueState.Error);
					this.getView().byId('idCRExpDate').setValueState(sap.ui.core.ValueState.Error);
					sap.m.MessageToast.show("Please enter CR From and Expiray Date Correctly");
					return;
				} else {
					this.getView().byId('idCRFromDate').setValueState(sap.ui.core.ValueState.None);
					this.getView().byId('idCRExpDate').setValueState(sap.ui.core.ValueState.None);
				}
				//10/30/24
				//01234567
				// cr_exp_date = "20"+cr_exp_date.substring(6,2) + cr_exp_date.substring(0,2) + cr_exp_date.substring(3,2);
				var TempCustomerData = {
					"ztempid": tempID,
					"znamear1": nameAr1,
					"znamear2": nameAr2,
					"znamear3": nameAr3,
					"znameen": nameEn,
					"zmobile": mobile,
					"zmobile2": alt_mob,
					"zemail": email,
					"zbuilding": building,
					"zstreet": street,
					"zdistrict": district,
					"zcity": city,
					"zpostalcode": pd,
					"zvat": vat,
					"zcr": cr,
					"zcr_exp_date": newDate,
					"zcr_from_date": newDateFrom,
					"zroute": route,
					"CreditLimit": creditLimit,
					"zDivison": division,
					"zpresellerid": preseller,
					"zpayTerm": payform,
					"zcomments": comment,
					"zshoplicense": shoplic,
					"visitDay": visitDay,
					"visitFrequency": visitFrequency,

					"DeliveryRoute": DelvRoute
				}
				var oModel = this.getView().getModel();
				var that = this;
				oModel.create("/customerDetailsSet",
					TempCustomerData, {
						success: function (oData6, response) {

							//this.getView().getModel("localModel").setProperty("/DigitalSignButton", true);
							sap.m.MessageToast.show("Request Has Been Saved");
							// UPdate UI
							that.getView().getModel("localModel").setProperty("/SaveButton", false);

							that.getView().getModel("localModel").setProperty("/EditButton", true);
							that.getView().getModel("localModel").setProperty("/allowEdit", false);
							that.handleUploadFiles();
						},
						error: function (oError) {
							var errorMsg = jQuery.parseJSON(oError.responseText).error.message.value;
							sap.m.MessageBox.error(errorMsg, {});
							return;
						}

					});

			},
			//***************************************************************************************************************************************************************************		
			handleUploadFiles: function () {

				var tempID = this.getView().byId("idTempId").getText();
				var oFileUploader = " ";
				if (tempID !== "") {
					//shop licesnse
					oFileUploader = this.getView().byId("idfileVAT");
					var domRef = oFileUploader.getFocusDomRef();
					var file = domRef.files[0];
					if (domRef.files.length !== 0) {
						var that = this;
						this.filenameLicense = file.name;
						this.filetypeLicense = file.type;
						this.getView().byId("idfileVAT").setValueState(sap.ui.core.ValueState.None);
						var reader = new FileReader();

						reader.onload = function (e) {

							var vContent = e.currentTarget.result.replace("data:" + that.filetypeLicense + ";base64,", "");
							var oDataModelVAT = that.getView().getModel();
							oDataModelVAT.setHeaders({
								"X-Requested-With": "X"
							});
							var payLoad = {
								"ztempid": tempID,
								"Type": "VAT",
								"Content": vContent,
								"Mimetype": that.filetypeLicense,
								"FileName": that.filenameLicense

							};
							oDataModelVAT.create("/CustomerAttachmentSet", payLoad, {
								success: function (oEvent) {
									sap.m.MessageToast.show("Success");
								},
								error: function (oError) {
									sap.m.MessageToast.show("error");
								}
							});
						};
						//file reader will start reading
						reader.readAsDataURL(file);
					}
					//CR
					oFileUploader = this.getView().byId("idfileCR");

					var domRef = oFileUploader.getFocusDomRef();
					var file = domRef.files[0];
					if (domRef.files.length !== 0) {

						this.filenameVAT = file.name;
						this.filetypeVAT = file.type;
						var that = this;
						this.getView().byId("idfileCR").setValueState(sap.ui.core.ValueState.None);
						var reader = new FileReader();

						reader.onload = function (e) {

							// var vContent = e.currentTarget.result.replace("application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,",
							// 	"");
							var vContent = e.currentTarget.result.replace("data:" + that.filetypeVAT + ";base64,", "");
							//	that.postToSap(this.getView().byId("idRequestId").getText(), that.filename, that.filetype, vContent, "GUARANTEE");
							var oDataModelCR = that.getView().getModel();
							oDataModelCR.setHeaders({
								"X-Requested-With": "X"
							});
							var payLoadCR = {
								"ztempid": tempID,
								"Type": "CR",
								"Content": vContent,
								"Mimetype": that.filetypeVAT,
								"FileName": that.filenameVAT

							};
							oDataModelCR.create("/CustomerAttachmentSet", payLoadCR, {
								success: function (oEvent) {
									sap.m.MessageToast.show("Success");
								},
								error: function (oError) {
									sap.m.MessageToast.show("error");
								}
							});
						};
						//file reader will start reading
						reader.readAsDataURL(file);
					}
					//Shop Licenence
					oFileUploader = this.getView().byId("idfileShop");
					//if (oFileUploader !== "") {
					var domRef = oFileUploader.getFocusDomRef();
					var file = domRef.files[0];
					if (domRef.files.length !== 0) {
						var that = this;
						this.filenameAgency = file.name;
						this.filetypeAgency = file.type;
						this.getView().byId("idfileShop").setValueState(sap.ui.core.ValueState.None);
						var reader = new FileReader();

						reader.onload = function (e) {

							var vContent = e.currentTarget.result.replace("data:" + that.filetypeAgency + ";base64,", "");

							var oDataModelShop = that.getView().getModel();
							oDataModelShop.setHeaders({
								"X-Requested-With": "X"
							});
							var payLoadShop = {
								"ztempid": tempID,
								"Type": "SHP",
								"Content": vContent,
								"Mimetype": that.filetypeAgency,
								"FileName": that.filenameAgency

							};
							oDataModelShop.create("/CustomerAttachmentSet", payLoadShop, {
								success: function (oEvent) {
									sap.m.MessageToast.show("Success");
								},
								error: function (oError) {
									sap.m.MessageToast.show("error");
								}
							});
						};
						//file reader will start reading
						reader.readAsDataURL(file);
					}
				}
			},
			onEnterDivisionID: function (oEvent) {
				var oModel = this.getView().getModel();
				var ID = this.getView().byId("idDivison").getValue();
				var sPath = "/DivisionSet('" + ID + "')";
				var that = this;
				oModel.read(sPath, {
					success: function (oData1, response) {
						//var oModel3 = new sap.ui.model.json.JSONModel(oData1);
						//var osf = that.getView().byId("IdViolationDetails");
						//osf.setModel(oModel3);
						if (oData1 && oData1.DivisionKey) {
							that.getView().byId("idDivisonText").setText(oData1.Name);
							// that.getView().byId("idZidentity").setText(oData1.Zidentity);
							that.getView().byId('idDivison').setValueState(sap.ui.core.ValueState.None);
							that.getView().getModel("localModel").setProperty("/SaveButton", true);
						}

					},
					error: function () {
						sap.m.MessageToast.show("No Data retreived for Division");
						that.getView().byId('idDivison').setValueState(sap.ui.core.ValueState.Error);
						that.getView().getModel("localModel").setProperty("/SaveButton", false);
						that.getView().byId("idDivisonText").setText("");

					}
				});
			},
			onEnterEmpID: function (oEvent) {
				var oModel = this.getView().getModel();
				var empID = this.getView().byId("idPreseller").getValue();
				var sPath = "/EmployeeDetailsSet('" + empID + "')";
				var that = this;
				oModel.read(sPath, {
					success: function (oData1, response) {
						//var oModel3 = new sap.ui.model.json.JSONModel(oData1);
						//var osf = that.getView().byId("IdViolationDetails");
						//osf.setModel(oModel3);
						if (oData1 && oData1.PresellerId) {
							that.getView().byId("idPresellerName").setText(oData1.PName);
							that.getView().byId('idPreseller').setValueState(sap.ui.core.ValueState.None);
							that.getView().getModel("localModel").setProperty("/SaveButton", true);
							// that.getView().byId("idZidentity").setText(oData1.Zidentity);
							// this.getView().byId('idPreseller').setValueState(sap.ui.core.ValueState.None);
						}

					},
					error: function () {
						sap.m.MessageToast.show("No Data retreived for Preseller");
						that.getView().byId('idPreseller').setValueState(sap.ui.core.ValueState.Error);
						that.getView().byId("idPresellerName").setText("");
						that.getView().getModel("localModel").setProperty("/SaveButton", false);

					}
				});
			},

		});

	});