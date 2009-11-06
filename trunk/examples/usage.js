$(function() {
    $("#basic-combo").sexyCombo();
    
    $("#empty-combo").sexyCombo({emptyText: "Choose a state..."});
    
    $("#autofill-combo").sexyCombo({autoFill: true});
    
    $("#selected-combo").sexyCombo({triggerSelected: true});
    
    $("#up-combo").sexyCombo({dropUp: true});
    
    $("#filter-combo").sexyCombo({filterFn: function() {
        return true;
    }, dropUp: true});
    
    $("#mixed-combo").sexyCombo({emptyText: "Choose a state", autoFill: true, dropUp: true});
    
    var data = [];
    $("#selectbox").children().each(function() {
        var $this = $(this);
        data.push({value: $this.attr("value"), text: $this.text()});
    });
    
    $.sexyCombo.create({name: "static-combo", id: "static-combo", container: "#static-container", data: data, dropUp: true});
});