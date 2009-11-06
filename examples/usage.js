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
});