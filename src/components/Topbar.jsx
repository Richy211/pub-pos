const Topbar = () => {
  return (
 

      <div className="h-16 flex items-center justify-between px-6 shadow 
      bg-white text-slate-900
      dark:bg-slate-800 dark:text-white">

<h2 className="text-xl font-bold flex items-center gap-2">
  🍺 Pub POS
</h2>

{!collapsed && (
  <p className="text-sm text-gray-400">{userName}</p>
)}



    </div>
  );
};

export default Topbar;