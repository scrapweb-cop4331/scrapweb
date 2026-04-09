export default function MyButton() {
  return (
    <button
      className="
        px-4 py-1 
        bg-material 
        text-material-text 
        border-2 
        border-t-border-lightest 
        border-l-border-lightest 
        border-b-border-darkest 
        border-r-border-darkest 
        active:border-t-border-darkest 
        active:border-l-border-darkest 
        active:border-b-border-lightest 
        active:border-r-border-lightest
      "
    >
      Standard Button
    </button>
  );
}
