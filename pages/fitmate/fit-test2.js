import EditableTable from "@/components/widgets/editable-table/EditableTable";


const columns = [{key: 'name', label: 'Exercise Name', type: 'text', editable: true}, {
    key: 'weight', label: 'Weight (kg)', type: 'number', editable: true
}, {
    key: 'type', label: 'Type', type: 'select', options: ['Strength', 'Cardio', 'Mobility'], editable: true
}, {key: 'reps', label: 'Repetition', type: 'number', editable: false}, // read-only
];


const data = [{name: 'Bench Press', weight: '50', type: 'Chest', reps: '10'}, {
    name: 'Deadlift', weight: '80', type: 'Legs', reps: '8'
},];
const FitTest2 = () => {
    return <EditableTable columns={columns} data={data} onChange={(updated) => console.log(updated)}/>;
}

export default FitTest2