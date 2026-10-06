module.exports = async function callApi(url, options = {}) {

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            ...options
        });


        /*
         * Coba membaca JSON
         */

        let result;

        try {

            result = await response.json();

        } catch (error) {

            return {
                success: false,
                message: 'API mengembalikan response bukan JSON.'
            };

        }


        /*
         * HTTP error
         */

        if (!response.ok) {

            return {
                success: false,
                message:
                    result?.message ||
                    `API error HTTP ${response.status}`
            };

        }


        /*
         * Validasi format response
         */

        if (
            typeof result !== 'object' ||
            result === null ||
            typeof result.success !== 'boolean' ||
            typeof result.message !== 'string'
        ) {

            return {
                success: false,
                message: 'API mengembalikan format response yang tidak valid.'
            };

        }


        /*
         * Response valid
         */

        return result;


    } catch (error) {

        console.error(
            '[API ERROR]',
            error
        );

        return {
            success: false,
            message: 'Tidak dapat menghubungi API.'
        };

    }

};