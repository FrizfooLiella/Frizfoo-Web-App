function formatRupiah(nilai) { // function untk mengubah angka menjadi format rupiah

    let format = nilai.toString().split('').reverse().join(''),
        convert = format.match(/\d{1,3}/g);
    rupiah = convert.join('.').split('').reverse().join('');

    return rupiah;
}



function rupiahToString(nilai) { // function utk ubah string rupiah menjadi string angka polos

    let stringPolos = nilai.replace(/[^\w\s]/gi, '');
    return stringPolos;

}



module.exports = {
    formatRupiah: formatRupiah,
    rupiahToString: rupiahToString
}

