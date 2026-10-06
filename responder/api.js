module.exports = async function callApi(url, data = {}) {

    try {

        const response = await fetch(url, {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            body: JSON.stringify(data)
        });


        let result;

        try {

            result = await response.json();

        } catch (error) {

            return {
                success: false,
                message: 'API mengembalikan response bukan JSON.'
            };

        }


        if (!response.ok) {

            return {
                success: false,
                message:
                    typeof result?.message === 'string'
                        ? result.message
                        : `API error HTTP ${response.status}`
            };

        }


        if (
            typeof result !== 'object' ||
            result === null ||
            typeof result.success !== 'boolean' ||
            typeof result.message !== 'string'
        ) {

            return {
                success: false,
                message: 'Format response API tidak valid.'
            };

        }


        return result;


    } catch (error) {

        console.error(
            `[API ERROR] ${url}`,
            error.message
        );

        return {
            success: false,
            message: 'Tidak dapat menghubungi API.'
        };

    }

};
