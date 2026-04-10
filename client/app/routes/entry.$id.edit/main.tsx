import { useParams } from 'react-router';
import EditableTextBox from '../routes/entry.$id.edit/ExampleReactComponent'

export default function EntryEdit() {
  // The key 'id' matches the '$id' in the filename
  const { id } = useParams(); 

  return (
    <div className="pl-8 pt-8" >
      <h1>Editing Entry: {id}</h1>
      <EditableTextBox />  
       <p>You can achieve whatever you can imagine.</p>
    </div>
  );
}