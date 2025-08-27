export const fetchData = async (URL) => {
    try {
        const response = await fetch(URL, {
            method: 'GET', headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const postData = async (URL, formData = {}) => {
    try {
        const response = await fetch(URL, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Response data:', data);

        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const POST = async (URL, formData = {}) => {
    try {
        const response = await fetch(URL, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save the data' + error);
    }
};

export const postDataAsJson = async (URL, formData = {}) => {
    try {
        console.log("Form data" + JSON.stringify(formData));
        const response = await fetch(URL, {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw new error;
    }
};

export const updateData = async (URL, formData = {}) => {
    try {
        const response = await fetch(URL, {
            method: 'PUT', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw new error;
    }
};

export const deleteData = async (URL) => {
    try {
        const response = await fetch(URL, {
            method: 'DELETE', headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const DeleteByObject = async (URL, formData) => {
    try {
        console.log("Data before deletion: " + JSON.stringify(formData));
        const response = await fetch(URL, {
            method: 'DELETE', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const ModelData = ['gemma3', 'gemma3:1b', 'phi4-mini-reasoning:3.8b', 'llama3.2:latest', 'deepseek-r1:1.5b', "phi4-mini:latest", 'qwen3:8b', 'mistral:7b', 'deepseek-r1:7b']