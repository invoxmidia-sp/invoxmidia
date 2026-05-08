insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true) on conflict (id) do nothing;

create policy "Public read site-assets"
on storage.objects for select
using (bucket_id = 'site-assets');