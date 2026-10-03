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
  /* Member reviews shown on Home. Newest reviews added through the form are kept on the visitor's device
     (see NF.reviews in js/main.js) until a backend exists. Add more here: name, year, course, text. */
  reviews: [
    { name: "Ishaan Mehta", year: "Second-year", course: "Computer Science",           text: "I went from barely knowing Git to shipping a full-stack app in a semester. The workshops break things down without dumbing them down." },
    { name: "Rohan Patel",  year: "Second-year", course: "Information Technology",     text: "I walked into my first hackathon knowing almost nothing. A year later I was mentoring the next batch of first-years." },
    { name: "Kabir Shah",   year: "Final-year",  course: "Computer Science",           text: "NeoFolks events are where I met my current co-founders. It's less a club and more a launchpad for whatever you're trying to build." },
    { name: "Neha Trivedi", year: "Final-year",  course: "Electronics & Communication",text: "The community here doesn't gatekeep. Whatever your background, there's a workshop, a project, or a person ready to help you learn." },
    { name: "Ananya Rao",   year: "Third-year",  course: "Information Technology",     text: "What stuck with me was how much ownership members get. I ran a workshop in my second year and it changed how I saw myself as a builder." },
    { name: "Meera Iyer",   year: "Second-year", course: "Electronics & Communication",text: "I came for one workshop and stayed for the community. There's always someone further along willing to pair with you on something new." }
  ],
  catLabels: { workshops: "Workshops", seminars: "Seminars", competitions: "Competitions", community: "Community" }
};
