import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { pathToFileURL } from 'url';

const defaultUsersFile = new URL('../data/users.json', import.meta.url);

const getUsersFile = () => {
    if (process.env.LOCAL_USERS_FILE) {
        return pathToFileURL(process.env.LOCAL_USERS_FILE);
    }

    return defaultUsersFile;
};

const getDataDir = () => new URL('./', getUsersFile());

const ensureUsersFile = async () => {
    const usersFile = getUsersFile();
    await mkdir(getDataDir(), { recursive: true });

    try {
        await readFile(usersFile, 'utf8');
    } catch {
        await writeFile(usersFile, '[]\n', 'utf8');
    }
};

const readUsers = async () => {
    const usersFile = getUsersFile();
    await ensureUsersFile();
    const fileContents = await readFile(usersFile, 'utf8');

    try {
        return JSON.parse(fileContents);
    } catch {
        await writeFile(usersFile, '[]\n', 'utf8');
        return [];
    }
};

const writeUsers = async (users) => {
    const usersFile = getUsersFile();
    await ensureUsersFile();
    await writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
};

const findLocalUserByEmail = async (email) => {
    const users = await readUsers();
    return users.find((user) => user.email === email.toLowerCase()) || null;
};

const findLocalUserById = async (id) => {
    const users = await readUsers();
    return users.find((user) => user._id === id) || null;
};

const createLocalUser = async ({ name, email, passwordHash }) => {
    const users = await readUsers();

    const newUser = {
        _id: randomUUID(),
        name,
        email: email.toLowerCase(),
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    await writeUsers(users);

    return newUser;
};

export { createLocalUser, findLocalUserByEmail, findLocalUserById };
