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
    
    data[0].selected = true;
    $.sexyCombo.create({name: "static-selected-combo", id: "static-selected-combo", container: "#static-selected", data: data, dropUp: true, triggerSelected: true});
    
    $.sexyCombo.create({name: "ajax-combo", id: "ajax-combo", container: "#ajax-container", url: "example.json", dropUp: true});
});