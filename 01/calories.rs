use itertools::Itertools;
use std::fs;

fn elf_sums(raw_input: &str) -> impl Iterator<Item = i32> + '_ {
    raw_input
        .split("\n\n")
        .map(|elf_lines| elf_lines.lines().flat_map(str::parse::<i32>).sum())
}

/// Part 1 - Find the Elf carrying the most Calories. How many total Calories is that Elf carrying?
fn part_1(raw_input: &str) -> i32 {
    elf_sums(raw_input)
        .max()
        .expect("input should not be empty")
}

/// Part 2 -  Find the top three Elves carrying the most Calories. How many Calories are those Elves carrying in total?
fn part_2(raw_input: &str) -> i32 {
    elf_sums(raw_input).sorted().rev().take(3).sum()
}

fn main() {
    // Read input file
    let input = fs::read_to_string("input.txt").expect("input.txt should be readable");

    let result_part_1 = part_1(&input);
    println!("{:?}", result_part_1);

    let result_part_2 = part_2(&input);
    println!("{:?}", result_part_2);
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_DATA: &str = "1000
2000
3000

4000

5000
6000

7000
8000
9000

10000";

    #[test]
    fn test_part_1() {
        assert_eq!(part_1(SAMPLE_DATA), 24000);
    }

    #[test]
    fn test_part_2() {
        assert_eq!(part_2(SAMPLE_DATA), 45000);
    }
}
