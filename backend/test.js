const BASE_URL = "https://leetpath-go.onrender.com"; // Replace with the actual API base URL

async function testAddUser() {
    const url = `${BASE_URL}/addUser`;
    const data = {
        email: "testuser@example.com",
        username: "testuser",
        name: "Test User",
        institution: "Test Institution",
        leetcode_username: "test_leetcode_user"
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Add User Response:", result);
}

async function testGetUserData() {
    const url = `${BASE_URL}/getUserData`;
    const data = { email: "testuser@example.com" };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Get User Data Response:", result);
}

async function testAddSolvedQuestion() {
    const url = `${BASE_URL}/addSolvedQuestion`;
    const data = {
        email: "testuser@example.com",
        question_slug: "two-sum"
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Add Solved Question Response:", result);
}

async function testGetSolvedQuestions() {
    const url = `${BASE_URL}/getSolvedQuestions`;
    const data = { email: "testuser@example.com" };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Get Solved Questions Response:", result);
}

async function testUpdateSolvedWithLeetCode() {
    const url = `${BASE_URL}/updateSolvedWithLeetCode`;
    const data = { email: "testuser@example.com" };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Update Solved with LeetCode Response:", result);
}

async function testRemoveSolvedQuestion() {
    const url = `${BASE_URL}/removeSolvedQuestion`;
    const data = {
        email: "testuser@example.com",
        question_slug: "two-sum"
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Remove Solved Question Response:", result);
}

async function testGetStats() {
    const url = `${BASE_URL}/getStats`;
    const data = { email: "testuser@example.com" };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Get Stats Response:", result);
}

async function testProblemData() {
    const url = `${BASE_URL}/problemData`;
    const data = { titleSlug: "two-sum" };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Problem Data Response:", result);
}

async function testProblemSet() {
    const url = `${BASE_URL}/problemSet?limit=10`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();
    console.log("Problem Set Response:", result);
}

async function testUpdateUser() {
    const url = `${BASE_URL}/updateUser`;
    const data = {
        email: "testuser@example.com",
        username: "updateduser",
        name: "Updated Name"
    };

    const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log("Update User Response:", result);
}

async function testEndpoints() {
    console.log("Testing API Endpoints...\n");

    await testAddUser();
    await delay(2000);

    await testGetUserData();
    await delay(2000);

    await testAddSolvedQuestion();
    await delay(2000);

    await testGetSolvedQuestions();
    await delay(2000);

    await testUpdateSolvedWithLeetCode();
    await delay(2000);

    await testRemoveSolvedQuestion();
    await delay(2000);

    await testGetStats();
    await delay(2000);

    await testProblemData();
    await delay(2000);

    await testProblemSet();
    await delay(2000);

    await testUpdateUser();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

testEndpoints();
