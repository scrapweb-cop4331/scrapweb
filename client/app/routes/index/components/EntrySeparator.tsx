interface EntrySeparatorProps {
  type: "month" | "year";
  label: string;
}

export const EntrySeparator: React.FC<EntrySeparatorProps> = ({ type, label }) => {
  return (
    <div className={`entry-separator ${type}`}>
      <h2 className="separator-heading">{label}</h2>
      <div className="separator-bar" />
    </div>
  );
};
