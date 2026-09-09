<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

$dataDirectory = __DIR__ . DIRECTORY_SEPARATOR . 'data';
$dataFile = $dataDirectory . DIRECTORY_SEPARATOR . 'docurace.json';

function empty_data() {
    return array('players' => array(), 'scores' => array());
}

function read_data($file) {
    if (!is_file($file)) {
        return empty_data();
    }

    $json = file_get_contents($file);
    $data = json_decode($json, true);
    if (!is_array($data)) {
        return empty_data();
    }

    return array(
        'players' => isset($data['players']) && is_array($data['players']) ? $data['players'] : array(),
        'scores' => isset($data['scores']) && is_array($data['scores']) ? $data['scores'] : array()
    );
}

function send_json($status, $data) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    send_json(200, read_data($dataFile));
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST, PUT');
    send_json(405, array('error' => 'Método no permitido'));
}

$body = file_get_contents('php://input');
$incoming = json_decode($body, true);
if (!is_array($incoming) || !isset($incoming['players']) || !isset($incoming['scores']) || !is_array($incoming['players']) || !is_array($incoming['scores'])) {
    send_json(400, array('error' => 'Formato de datos inválido'));
}

if (!is_dir($dataDirectory) && !mkdir($dataDirectory, 0755, true)) {
    send_json(500, array('error' => 'No se pudo crear la carpeta data'));
}

$cleanData = array('players' => $incoming['players'], 'scores' => $incoming['scores']);
$tempFile = $dataFile . '.tmp';
$encoded = json_encode($cleanData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

if (file_put_contents($tempFile, $encoded, LOCK_EX) === false || !rename($tempFile, $dataFile)) {
    @unlink($tempFile);
    send_json(500, array('error' => 'No se pudo guardar el archivo JSON'));
}

send_json(200, array('ok' => true));
