<?php

$rawInput = file_get_contents('input.txt');
$rawElvesData = explode("\n\n", $rawInput);

$sums = [];
foreach($rawElvesData as $elvesData) {
    $calories = array_map('intval',explode("\n", $elvesData));
    $sum =  array_sum($calories);
    $sums[] = $sum;
}
sort($sums);
$largestSum = max($sums);
var_dump($largestSum);

$largestThreeSums = array_slice($sums, -3, 3);
$totalAmountOfTheLargestThreeSums = array_sum($largestThreeSums);
var_dump($totalAmountOfTheLargestThreeSums);
