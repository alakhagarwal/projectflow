function Home() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <Box className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />

      {/* Main Content */}
      <Box className="flex-1 flex flex-col">
        {/* Header */}
        <Header userName="Alakh Agarwal" />

        {/* Dashboard Content */}
        <Dashboard userName="Alakh Agarwal" orgName="Org1" />
      </Box>
    </Box>
  );
}

export default Home;