//script untuk menangani proses response dari proses request API
function status(response) {

    if (!response.ok) {
        console.log(`Error: ${response.status}`);
        throw new Error(response.status);   // Kita throw error jika response tidak sesuai, dan nnti di tangkap oleh catch
    }
    console.log(response.status + response.statusText);
    return response.json();

}