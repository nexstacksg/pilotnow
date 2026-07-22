WITH candidates AS (
  SELECT
    ja.id,
    ja.hours_worked,
    ja.payable,
    round((extract(epoch from (j.end_at - j.start_at)) / 3600)::numeric, 2) AS scheduled_hours,
    round((extract(epoch from (j.end_at - j.start_at)) / 36)::numeric, 2) AS buggy_hours,
    coalesce(ja.rate_agreed, ja.rate_offered) AS rate
  FROM job_assignments ja
  INNER JOIN jobs j ON j.id = ja.job_id
),
affected AS (
  SELECT
    id,
    scheduled_hours,
    rate
  FROM candidates
  WHERE
    scheduled_hours > 0
    AND (
      (
        hours_worked IS NOT NULL
        AND round(hours_worked, 2) = buggy_hours
      )
      OR (
        hours_worked IS NULL
        AND payable IS NOT NULL
        AND rate IS NOT NULL
        AND round(payable, 2) = round((buggy_hours * rate)::numeric, 2)
      )
    )
)
UPDATE job_assignments ja
SET
  hours_worked = affected.scheduled_hours,
  payable = CASE
    WHEN affected.rate IS NULL THEN ja.payable
    ELSE round((affected.scheduled_hours * affected.rate)::numeric, 2)
  END
FROM affected
WHERE ja.id = affected.id;
