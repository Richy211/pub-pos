import React from "react";

const TableCard = ({ table, onClick }) => {
  const isOccupied = table.status === "occupied";

  return (
    <div
      onClick={() => onClick(table)}
      className={`
        cursor-pointer rounded-2xl p-6 text-center
        transition-all duration-200
        shadow-lg
        ${isOccupied 
          ? "bg-red-500 hover:bg-red-600" 
          : "bg-green-500 hover:bg-green-600"}
      `}
    >
      <h2 className="text-3xl font-bold text-white">
        Mesa {table.number}
      </h2>

      <p className="mt-2 text-white/80">
        {isOccupied ? "Ocupada" : "Libre"}
      </p>
    </div>
  );
};


export default TableCard;