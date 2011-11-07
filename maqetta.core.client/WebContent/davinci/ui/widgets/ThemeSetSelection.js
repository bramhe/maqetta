dojo.provide("davinci.ui.widgets.ThemeSetSelection");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require('davinci.workbench.WidgetLite');
dojo.require("davinci.ve.widgets.HTMLStringUtil");
dojo.require("dijit.layout.ContentPane");
dojo.require("davinci.ui.widgets.ThemeStore");

dojo.declare("davinci.ui.widgets.ThemeSetSelection", null, {
    
    workspaceOnly : false,
    message: 'Theme version does not match workspace version this could produce unexpected results. We suggest recreating the custom theme using the current version of Maqetta and deleting the existing theme.',
   // _THEME_SET_NONE: '(none)',
    _connections: [],
    _selectedThemeSet: null,

    buildRendering: function(){
        this._dialog = new dijit.Dialog({
            title: "Select theme",
            style: "width: 372px"
        });
        dojo.connect(this._dialog, "onCancel", this, "onClose");
        var currentThemeSet = davinci.theme.getThemeSet(davinci.Workbench.getOpenEditor().getContext());
        if (!currentThemeSet){
            currentThemeSet = davinci.theme.dojoThemeSets.themeSets[0]; // default;
            
        }
        this._selectedThemeSet = currentThemeSet;
        this._dialog.attr("content", this._getTemplate());
        this._connections.push(dojo.connect(dijit.byId('theme_select_themeset_theme_select'), "onChange", this, "onChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_desktop_theme_select'), "onChange", this, "onDesktopChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_mobile_theme_select'), "onChange", this, "onMobileChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_ok_button'), "onClick", this, "onOk"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_cancel_button'), "onClick", this, "onClose"));
/*        this._connections.push(dojo.connect(dijit.byId('theme_select_android_select'), "onChange", this, "onDeviceChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_blackberry_select'), "onChange", this, "onDeviceChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_ipad_select'), "onChange", this, "onDeviceChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_iphone_select'), "onChange", this, "onDeviceChange"));
        this._connections.push(dojo.connect(dijit.byId('theme_select_other_select'), "onChange", this, "onDeviceChange"));*/
        this.addThemeSets();
        var select = dijit.byId('theme_select_themeset_theme_select');
        select.attr( 'value', currentThemeSet.name);
        this._dialog.show();

    },

    addThemeSets: function(){

        this._dojoThemeSets = davinci.workbench.Preferences.getPreferences("maqetta.dojo.themesets", davinci.Runtime.getProject());
        if (!this._dojoThemeSets){ 
            this._dojoThemeSets =  davinci.theme.dojoThemeSets;
            
        }
        this._dojoThemeSets = dojo.clone(this._dojoThemeSets); // make a copy so we won't effect the real object
        if (this._selectedThemeSet.name == davinci.theme.none_themeset_name){
            this._dojoThemeSets.themeSets.unshift(this._selectedThemeSet); // temp add to prefs
        } else {
            this._dojoThemeSets.themeSets.unshift(davinci.theme.none_themeset); // temp add to prefs 
        }
        var select = dijit.byId('theme_select_themeset_theme_select');
        //var opt = {value: '(none)', label: '(none)'}; // FIXME NLS
        //select.addOption(opt);
        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
            opt = {value: this._dojoThemeSets.themeSets[i].name, label: this._dojoThemeSets.themeSets[i].name};
            select.addOption(opt);
        }
        
    },
    
    addThemes: function(themeSet){

        this._themeData = davinci.library.getThemes(davinci.Runtime.getProject(), this.workspaceOnly, true);
        var dtSelect = dijit.byId('theme_select_desktop_theme_select');
        dtSelect.options = [];
        var androidSelect = dijit.byId('theme_select_android_select');
        androidSelect.options = [];
        var blackberrySelect = dijit.byId('theme_select_blackberry_select');
        blackberrySelect.options = [];
        var ipadSelect = dijit.byId('theme_select_ipad_select');
        ipadSelect.options = [];
        var iphoneSelect = dijit.byId('theme_select_iphone_select');
        iphoneSelect.options = [];
        var otherSelect = dijit.byId('theme_select_other_select');
        otherSelect.options = [];
        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
        dtSelect.options = [];
        mblSelect.options = [];
        mblSelect.addOption({value: davinci.theme.default_theme, label: davinci.theme.default_theme});
        //mblSelect.addOption({value: davinci.theme.none_theme, label: davinci.theme.none_theme});
        this._themeCount = this._themeData.length;
        for (var i = 0; i < this._themeData.length; i++){
            var opt = {value: this._themeData[i].name, label: this._themeData[i].name};
            if (this._themeData[i].type === 'dojox.mobile'){
                mblSelect.addOption(opt);
                androidSelect.addOption(opt);
                blackberrySelect.addOption(opt);
                ipadSelect.addOption(opt);
                iphoneSelect.addOption(opt);
                otherSelect.addOption(opt);
            } else {
                dtSelect.addOption(opt);
            }
            
        }
        dtSelect.attr( 'value', themeSet.desktopTheme);
        for (var d = 0; d < themeSet.mobileTheme.length; d++){
            var device = themeSet.mobileTheme[d].device.toLowerCase(); 
            switch (device) {
            case 'android':
                androidSelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            case 'blackberry':
                blackberrySelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            case 'ipad':
                ipadSelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            case 'iphone':
                iphoneSelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            case 'other':
                otherSelect.attr( 'value', themeSet.mobileTheme[d].theme);
                break;
            }
        }
        if (davinci.theme.singleMobileTheme(themeSet)) {
            mblSelect.attr( 'value', themeSet.mobileTheme[themeSet.mobileTheme.length-1].theme);
        } /*else if(davinci.theme.themeSetEquals(themeSet.mobileTheme,davinci.theme.dojoMobileNone)){
            debugger;
            mblSelect.attr( 'value', davinci.theme.none_theme); 
        } */else /*if(davinci.theme.themeSetEquals(themeSet.mobileTheme,davinci.theme.dojoMobileDefault))*/{
            debugger;
            mblSelect.attr( 'value', davinci.theme.default_theme); 
            this.onMobileChange(davinci.theme.default_theme); //force refresh
        } /*else {
            debugger;
            mblSelect.attr( 'value', themeSet.mobileTheme[themeSet.mobileTheme.length-1].theme);
        }*/
        
    },
      
    onChange : function(e){

        for (var i = 0; i < this._dojoThemeSets.themeSets.length; i++){
            if (this._dojoThemeSets.themeSets[i].name == e) {
                this.addThemes(this._dojoThemeSets.themeSets[i]);
                this._selectedThemeSet = this._dojoThemeSets.themeSets[i];
                break;
            }
         
        }
        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
        var dtSelect = dijit.byId('theme_select_desktop_theme_select');
        if (e === davinci.theme.none_themeset_name) {
            mblSelect.set('disabled', false);
            dtSelect.set('disabled', false);
        } else {
            var androidSelect = dijit.byId('theme_select_android_select');
            var blackberrySelect = dijit.byId('theme_select_blackberry_select');
            var ipadSelect = dijit.byId('theme_select_ipad_select');
            var iphoneSelect = dijit.byId('theme_select_iphone_select');
            var otherSelect = dijit.byId('theme_select_other_select');
            
            mblSelect.set('disabled', true);
            dtSelect.set('disabled', true);
            androidSelect.set('disabled', true);
            blackberrySelect.set('disabled', true);
            ipadSelect.set('disabled', true);
            iphoneSelect.set('disabled', true);
            otherSelect.set('disabled', true);
            
        }
        
    },
    
    onDesktopChange : function(e){
  
        this._selectedThemeSet.desktopTheme = e;
               
    },
    
    onMobileChange : function(e){
        
        var mblSelect = dijit.byId('theme_select_mobile_theme_select');
        var androidSelect = dijit.byId('theme_select_android_select');
        var blackberrySelect = dijit.byId('theme_select_blackberry_select');
        var ipadSelect = dijit.byId('theme_select_ipad_select');
        var iphoneSelect = dijit.byId('theme_select_iphone_select');
        var otherSelect = dijit.byId('theme_select_other_select');
        
        if ((e === '(device-specific)') &&  (this._selectedThemeSet.name === davinci.theme.none_themeset_name)) {
            androidSelect.set('disabled', false);
            blackberrySelect.set('disabled', false);
            ipadSelect.set('disabled', false);
            iphoneSelect.set('disabled', false);
            otherSelect.set('disabled', false);
        } else {
            for (var d = 0; d < this._selectedThemeSet.mobileTheme.length; d++){
                var device = this._selectedThemeSet.mobileTheme[d].device.toLowerCase(); 
                this._selectedThemeSet.mobileTheme[d].theme = e;
                switch (device) {
                case 'android':
                    androidSelect.attr( 'value', e);
                    androidSelect.set('disabled', true);
                    break;
                case 'blackberry':
                    blackberrySelect.attr( 'value', e);
                    blackberrySelect.set('disabled', true);
                    break;
                case 'ipad':
                    ipadSelect.attr( 'value', e);
                    ipadSelect.set('disabled', true);
                    break;
                case 'iphone':
                    iphoneSelect.attr( 'value', e);
                    iphoneSelect.set('disabled', true);
                    break;
                case 'other':
                    otherSelect.attr( 'value', e);
                    otherSelect.set('disabled', true);
                    break;
                }
            }
        }
   
        
    },
    
    
    updateDeviceThemes: function(){

        for (var i = 0; i < this._selectedThemeSet.mobileTheme.length; i++){
            var select;
            switch (this._selectedThemeSet.mobileTheme[i].device.toLowerCase()){
            case 'android' :
                select = dijit.byId('theme_select_android_select');
                break;
            case 'blackberry' :
                select = dijit.byId('theme_select_blackberry_select');
                break;
            case 'ipad' :
                select = dijit.byId('theme_select_ipad_select');
                break;
            case 'iphone' :
                select = dijit.byId('theme_select_iphone_select');
                break;
            default :
                select = dijit.byId('theme_select_other_select');
                
            }
            this._selectedThemeSet.mobileTheme[i].theme = select.attr( 'value');
        }

    },
    
      
    _changeTheme : function(){
        debugger;
        var e = davinci.Workbench.getOpenEditor();
        if (e && e.getContext)
            e.getContext().getCommandStack().execute(new davinci.ve.commands.ChangeThemeCommand(newTheme, e.getContext()));
    },
    
    _onChange :function(){ 
        debugger;
        var currentValue = this._getValueAttr();
        if( currentValue==null  ||  this._blockChange)
            return;
        this.value = currentValue;
        this._cookieName = 'maqetta_'+currentValue.name+'_'+currentValue.version;
        var warnCookie = dojo.cookie(this._cookieName);
        if (this.dojoVersion && currentValue.version !== this.dojoVersion && !warnCookie){
            this._warnDiv.innerHTML = '<table>' + 
                                            '<tr><td></td><td>'+this.message+'</td><td></td></tr>'+
                                             '<tr><td></td><td align="center"><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.ok">Ok</button><button data-dojo-type="dijit.form.Button" type="button" id="davinci.ui.widgets.ThemeSelection.cancel">Cancel</button></td><td></td></tr>'+
                                       '</table>';
            var ok = dijit.byId('davinci.ui.widgets.ThemeSelection.ok');
            var cancel = dijit.byId('davinci.ui.widgets.ThemeSelection.cancel');
            dojo.connect(ok, "onClick", this, "_warnOk");
            dojo.connect(cancel, "onClick", this, "_warnCancel");
            
            
        } else {
            this.onChange();
        }
        
        
        
    },
    
    
    _getThemeDataAttr : function(){
        debugger;
        return this._themeData;
    },
    
    _warnOk: function(){
        debugger;
        dojo.cookie(this._cookieName, "true");
        this._destroy();
        this.onChange();
        
    },
    
    _warnCancel: function(){
        debugger;
        this._destroy();
        this.onClose();
        
    },
    
    _destroy: function(){
        debugger;
        var ok = dijit.byId('davinci.ui.widgets.ThemeSelection.ok');
        dojo.disconnect(ok);
        ok.destroy();
        var cancel = dijit.byId('davinci.ui.widgets.ThemeSelection.cancel');
        dojo.disconnect(cancel);
        cancel.destroy();
    },
    
    onOk: function(e){

       // davinci.workbench.Preferences.savePreferences("maqetta.dojo.themesets", davinci.Runtime.getProject(),this._dojoThemeSets);
        this.updateDeviceThemes();
        this.onClose(e);
        var e = davinci.Workbench.getOpenEditor();
        if (e && e.getContext)
            e.getContext().getCommandStack().execute(new davinci.ve.commands.ChangeThemeCommand(this._selectedThemeSet, e.getContext()));
    },
    
    onClose: function(e){

        while (connection = this._connections.pop()){
            dojo.disconnect(connection);
        }
        this._dialog.destroyDescendants();
        this._dialog.destroy();
        delete this._dialog;
    },
    
    _getTemplate: function(){

        var template = ''+
            '<table style="width: 100%; margin-left:10px; margin-right:10px;">'+
                '<tr><td style="width: 18%;">Theme set:</td><td style="text-align: center;"><select dojoType="dijit.form.Select" id="theme_select_themeset_theme_select" type="text" style="width: 175px;" ></select></td></tr>'+
            '</table>' +
            '<div style="border-top: 1px solid black; top: 231px; border-top-color: #ccc; left: 429px; width: 300px; height: 11px; margin-top: 6px; margin-left:10px;"></div>'+
            '<table style="margin-left: 15px; width: 100%;">'+
                '<tr><td>Dojo desktop 1.7 theme:</td><td><select dojoType="dijit.form.Select" id="theme_select_desktop_theme_select"type="text"  style="width: 175px;"  ></select></td></tr>'+
                '<tr><td>Dojo mobile 1.7 theme:</td><td><select dojoType="dijit.form.Select" id="theme_select_mobile_theme_select"type="text"  style="width: 175px;" ></select></td></tr>'+
            '</table>' +
            '<table id="theme_select_devices_table" style="margin-left:30px; border-collapse: separate; border-spacing: 0 0; width: 100%">' +
            '<tr><td style="width: 139px;">Android:</td><td><select dojoType="dijit.form.Select" id="theme_select_android_select" type="text"  style="width: 150px;"></select></td></tr>' +
            '<tr><td>Blackberry:</td><td><select dojoType="dijit.form.Select" id="theme_select_blackberry_select" type="text"  style="width: 150px;"></select></td></tr>' +
            '<tr><td>iPad:</td><td><select dojoType="dijit.form.Select" id="theme_select_ipad_select" type="text"  style="width: 150px;"></select></td></tr>' +
            '<tr><td>iPhone:</td><td><select dojoType="dijit.form.Select" id="theme_select_iphone_select" type="text"  style="width: 150px;"></select></td></tr>' +
            '<tr><td>Other:</td><td><select dojoType="dijit.form.Select" id="theme_select_other_select" type="text"  style="width: 150px;"></select></td></tr>' +
            '</table>' +
            /*'<table id="theme_select_radio_table" style="margin-top:5px; margin-left:30px;">' +
            '<tr><td>Mobile theme applies to:</td><td></td></tr>' +
            '<tr><td style="padding-left:15px;"><input showlabel="true" type="radio" id="theme_select_all_devices_radio" dojoType="dijit.form.RadioButton"></input><label>All mobile devices</label></td><td></td></tr>' +
            '<tr><td style="padding-left:15px;"> <input showlabel="true" type="radio" id="theme_select_devices_radio" dojoType="dijit.form.RadioButton"></input><label>Selected devices</label></td><td></td></tr>' +
            '</table>' +
            '<table id="theme_select_devices_table" style="margin-left:60px;">' +
                '<tr><td></td><td><input id="theme_select_android_checkbox" name="theme_select_android_checkbox" dojoType="dijit.form.CheckBox" value="Android"><label for="theme_select_android_checkbox">Android</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_blackberry_checkbox" name="theme_select_blackberry_checkbox" dojoType="dijit.form.CheckBox" value="BlackBerry"><label for="theme_select_blackberry_checkbox">BlackBerry</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_ipad_checkbox" name="theme_select_ipad_checkbox" dojoType="dijit.form.CheckBox" value="iPad"><label for="theme_select_ipad_checkbox">iPad</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_iphone_checkbox" name="theme_select_iphone_checkbox" dojoType="dijit.form.CheckBox" value="iPhone"><label for="theme_select_iphone_checkbox">iPhone</label></td></tr>' +
                '<tr><td></td><td><input id="theme_select_other_checkbox" name="theme_select_other_checkbox" dojoType="dijit.form.CheckBox" value="other"><label for="theme_select_other_checkbox">Other</label></td></tr>' +
            '</table>'+*/
            '<table style="width:100%; margin-top: 10px;">'+
                '<tr><td style="text-align:right; width:80%;"><input type="button" dojoType="dijit.form.Button" id="theme_select_ok_button" label="Ok"></input></td><td><input type="button" dojoType="dijit.form.Button" id="theme_select_cancel_button" label="Cancel"></input></td></tr>'+
             '</table>'+
             '';

           return template; 
    }
    
    
});