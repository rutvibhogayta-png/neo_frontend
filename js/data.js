/* Centralized, editable content for the NeoFolks frontend.
   Edit this file to update technologies, stats, team and events. */
window.NEOFOLKS_DATA = {
  technologies: [
    { name: "Python",        category: "Language" },
    { name: "AI / ML",       category: "Intelligence" },
    { name: "Data Science",  category: "Discovery" },
    { name: "React",         category: "Interface" },
    { name: "TypeScript",    category: "Language" },
    { name: "Node.js",       category: "Backend" },
    { name: "UI / UX",       category: "Design" },
    { name: "Cloud",         category: "Infrastructure" },
    { name: "DevOps",        category: "Delivery" },
    { name: "Cybersecurity", category: "Defence" }
  ],
  stats: [
    { value: 240, suffix: "+", label: "Members" },
    { value: 32,  suffix: "",  label: "Events" },
    { value: 21,  suffix: "",  label: "Workshops" }
  ],
  /* Add a `photo: "assets/team/name.jpg"` field to show a portrait instead of initials. */
  team: [
    { name: "Vansh Shah",     role: "Community Lead",            initials: "VS",  tone: "bone" },
    { name: "Durva Desai",    role: "Content Lead",              initials: "DD",  tone: "ink" },
    { name: "Charls Gandhi",  role: "Tech Lead",                 initials: "CG",  tone: "ember" },
    { name: "Aditi Atodaria", role: "Tech Lead",                 initials: "AA",  tone: "deep" },
    { name: "Mann Shah",      role: "Social Media Lead",         initials: "MS",  tone: "lilac" },
    { name: "Priyansh Shah",  role: "Graphics Design Lead",      initials: "PS",  tone: "bone" },
    { name: "Heeral Nirkhe",  role: "Marketing & Outreach Lead", initials: "HN",  tone: "ink" },
    { name: "Open position",  role: "Event Operations Lead",     initials: "You", tone: "open", open: true }
  ],
  /* cat: workshops | seminars | competitions | community.  iso: YYYY-MM-DD.
     Upcoming vs past is worked out automatically from today's date. */
  events: [
    { iso: "2026-10-10", title: "Hacktober Fest",           cat: "workshops",    detail: "To conduct Hacktober Fest." },
    { iso: "2026-09-24", title: "Pull to Commit",           cat: "workshops",    detail: "Blockchain workshop." },
    { iso: "2023-12-10", title: "Web Development Bootcamp", cat: "seminars",     detail: "Intensive 3-day bootcamp covering HTML, CSS, JavaScript and React." },
    { iso: "2023-12-01", title: "Winter Code Hackathon",    cat: "competitions", detail: "24-hour coding marathon with innovative campus solutions." }
  ],
  catLabels: { workshops: "Workshops", seminars: "Seminars", competitions: "Competitions", community: "Community" }
};
