<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<form role="form" class="ai-tagger-settings">
				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">General</h5>

					<p class="lead">
						התאם את ההגדרות הללו. לאחר מכן תוכל לאחזר את ההגדרות הללו בקוד באמצעות:
						<br/><code>await meta.settings.get('ai-tagger');</code>
					</p>
					<div class="mb-3">
						<label class="form-label" for="custom-prompt">פרומפט מותאם אישית</label>
						<input type="text" id="custom-prompt" name="custom-prompt" title="פרומפט מותאם אישית" class="form-control" placeholder="הגדר את הפרומפט שלך">
					</div>
					<div class="mb-3">
						<label class="form-label" for="api-key">OpenAI API Key</label>
						<input type="text" id="api-key" name="api-key" title="API Key" class="form-control">
					</div>
				</div>
			</form>
		</div>

		<!-- IMPORT admin/partials/settings/toc.tpl -->
	</div>
</div>
