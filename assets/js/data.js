const hackathons = [
    {
        id: 1,
        title: "InnovateX 2026",
        organizer: "TechCorp Inc.",
        date: "Feb 15 - 17, 2026",
        mode: "Online",
        image: "https://images.unsplash.com/photo-1504384308090-c54be3855485?auto=format&fit=crop&q=80&w=600",
        tags: ["AI", "Blockchain"],
        deadline: "2026-02-10T23:59:59"
    },
    {
        id: 2,
        title: "CodeSprint Global",
        organizer: "DevCommunity",
        date: "Mar 05 - 07, 2026",
        mode: "Offline - NYC",
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600",
        tags: ["Web", "Cloud"],
        deadline: "2026-03-01T23:59:59"
    },
    {
        id: 3,
        title: "Hack The Future",
        organizer: "University of Tech",
        date: "Mar 20 - 22, 2026",
        mode: "Hybrid",
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=600",
        tags: ["IoT", "GreenTech"],
        deadline: "2026-03-15T23:59:59"
    }
];

const winners = [
    {
        id: 1,
        teamName: "Neural Ninjas",
        project: "AI Health Assistant",
        members: ["Alex", "Sam", "Jordan"],
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600",
        repo: "#",
        demo: "#"
    },
    {
        id: 2,
        teamName: "BlockChain Gang",
        project: "Decentralized Vote",
        members: ["Chris", "Pat", "Taylor"],
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600",
        repo: "#",
        demo: "#"
    }
];

const teamRequests = [
    {
        id: 1,
        user: "Sarah Chen",
        role: "Frontend Dev",
        lookingFor: ["Backend", "UI/UX"],
        event: "InnovateX 2026",
        skills: ["React", "Tailwind"],
        avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
        id: 2,
        user: "Mike Ross",
        role: "Full Stack",
        lookingFor: ["AI/ML Engineer"],
        event: "CodeSprint Global",
        skills: ["Node.js", "Python"],
    }
];

const currentUser = {
    name: "Alex Dev",
    role: "Full Stack Developer",
    hackathons: 12,
    wins: 3,
    projects: 8,
    skills: ["React", "Node.js", "Python", "TensorFlow"],
    achievements: ["Best UI/UX 2024", "Top 10 Global Hackathon", "Open Source Contributor"]
};
